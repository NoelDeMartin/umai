import { arraySwap } from '@noeldemartin/utils';
import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';

export interface ListDraggingController {
    start(event: MouseEvent | TouchEvent): void;
    update(event: MouseEvent | TouchEvent): void;
    stop(): void;
}

function getHoveringItem(event: MouseEvent | TouchEvent, listY: number, itemsHeight: number[]): number {
    const pointerY = 'pageY' in event ? event.pageY : event.touches[0]?.pageY;

    if (!pointerY || pointerY < listY)
        return 0;

    let y = listY;

    for (let item = 0; item < itemsHeight.length; item++) {
        y += itemsHeight[item] ?? 0;

        if (y > pointerY)
            return item;
    }

    return itemsHeight.length;
}

export function useListDragging(
    listRef: Ref<HTMLElement | undefined>,
    swapItems: (currentItem: number, nextItem: number) => void,
): ListDraggingController {
    const list = listRef;
    const active = ref(false);
    const listY = ref<number>(0);
    const itemsHeight = ref<number[]>([]);
    const currentItem = ref<number>(0);

    return {
        start(event) {
            if (!list.value?.firstElementChild) {
                return;
            }

            active.value = true;
            listY.value = window.scrollY + list.value.getBoundingClientRect().y;
            itemsHeight.value = Array.from(list.value.children).map(item => item.clientHeight);
            currentItem.value = getHoveringItem(event, listY.value, itemsHeight.value);
        },
        update(event) {
            if (!active)
                return;

            const nextItem = getHoveringItem(event, listY.value, itemsHeight.value);

            if (nextItem !== currentItem.value) {
                const updatedItemsHeight = [...itemsHeight.value];

                swapItems(currentItem.value, nextItem);
                arraySwap(updatedItemsHeight, currentItem.value, nextItem);

                nextTick().then(() => {
                    itemsHeight.value = Array.from(list.value?.children ?? []).map(item => item.clientHeight);
                    currentItem.value = nextItem;
                });
            }
        },
        stop() {
            active.value = false;
        },
    };
}
