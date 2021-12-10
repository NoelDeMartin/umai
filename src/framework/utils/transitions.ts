import { after } from '@noeldemartin/utils';
import { afterElementsUpdated, updateElement } from '@/framework/utils/dom';

export async function fadeIn(el: HTMLElement, duration: number = 700): Promise<void> {
    // Prepare elements
    updateElement(el, { styles: { opacity: '0' } });

    await afterElementsUpdated();

    // Transition
    updateElement(el, {
        transition: duration,
        styles: { opacity: '1' },
    });

    await after({ milliseconds: duration });

    // Clean up
    updateElement(el, { resetStyles: true });
}

export async function fadeOut(el: HTMLElement, duration: number = 700): Promise<void> {
    // Prepare element
    updateElement(el, { styles: { opacity: '1' } });

    await afterElementsUpdated();

    // Transition
    updateElement(el, {
        transition: duration,
        styles: { opacity: '0' },
    });

    await after({ milliseconds: duration });
}

export async function shrink(el: HTMLElement, duration: number = 300): Promise<void> {
    const initialHeight = el.getBoundingClientRect().height;

    // Prepare elements
    updateElement(el, {
        styles: {
            overflow: 'hidden',
            height: `${initialHeight}px`,
        },
    });

    await afterElementsUpdated();

    // Transition
    updateElement(el, {
        transition: duration,
        styles: { height: '0' },
    });

    await after({ milliseconds: duration });
}
