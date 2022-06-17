import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useResizeObserver($element: Ref<HTMLElement | null>, update: ($element: HTMLElement) => void): void {
    const resizeObserver = new ResizeObserver(() => $element.value && update($element.value));

    onMounted(() => {
        if (!$element.value) {
            return;
        }

        update($element.value);
        resizeObserver.observe($element.value);
    });

    onUnmounted(() => resizeObserver.disconnect());
}
