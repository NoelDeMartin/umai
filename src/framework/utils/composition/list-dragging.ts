import { arraySwap } from '@noeldemartin/utils';
import { nextTick } from 'vue';
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
    const list = $(listRef);

    let active = $ref(false);
    let listY = $ref<number>();
    let itemsHeight = $ref<number[]>();
    let currentItem = $ref<number>();

    return {
        start(event) {
            if (!list || !list.firstElementChild)
                return;

            active = true;
            listY = window.scrollY + list.getBoundingClientRect().y;
            itemsHeight = Array.from(list.children).map(item => item.clientHeight);
            currentItem = getHoveringItem(event, listY, itemsHeight);
        },
        update(event) {
            if (!active)
                return;

            const nextItem = getHoveringItem(event, listY, itemsHeight);

            if (nextItem !== currentItem) {
                const updatedItemsHeight = [...itemsHeight];

                swapItems(currentItem, nextItem);
                arraySwap(updatedItemsHeight, currentItem, nextItem);

                nextTick().then(() => {
                    itemsHeight = Array.from(list?.children ?? []).map(item => item.clientHeight);
                    currentItem = nextItem;
                });
            }
        },
        stop() {
            active = false;
        },
    };
}
