import { animateElement } from '@/framework/utils/dom';

export async function fadeIn(el: HTMLElement, duration: number = 700): Promise<void> {
    await animateElement(el, {
        duration,
        styles: { opacity: [0, 1] },
    });
}

export async function fadeOut(el: HTMLElement, duration: number = 700): Promise<void> {
    await animateElement(el, {
        duration,
        styles: { opacity: [1, 0] },
    });
}

export async function shrink(el: HTMLElement, duration: number = 300): Promise<void> {
    const initialHeight = el.getBoundingClientRect().height;

    await animateElement(el, {
        duration,
        before: { addClasses: 'overflow-hidden' },
        styles: { height: [`${initialHeight}px`, '0'] },
    });
}
