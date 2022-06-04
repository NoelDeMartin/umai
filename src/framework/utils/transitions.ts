import { animateElement } from '@/framework/utils/dom';

export async function slideUp(el: HTMLElement, duration: number = 500): Promise<void> {
    await animateElement(el, {
        duration,
        styles: {
            transform: [
                'translateY(100%)',
                'translateY(0)',
            ],
        },
    });
}

export async function slideDown(el: HTMLElement, duration: number = 500): Promise<void> {
    await animateElement(el, {
        duration,
        styles: {
            transform: [
                'translateY(0)',
                'translateY(100%)',
            ],
        },
    });
}

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
