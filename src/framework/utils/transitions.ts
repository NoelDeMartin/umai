import { animateElement } from '@/framework/utils/dom';

export async function delay($element: HTMLElement, duration: number): Promise<void> {
    await animateElement($element, {
        duration,
        before: { styles: { opacity: '0' } },
        after: { resetStyles: true },
    });
}

export async function slideUp(el: HTMLElement, duration: number): Promise<void> {
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

export async function slideDown($element: HTMLElement, duration: number): Promise<void> {
    await animateElement($element, {
        duration,
        styles: {
            transform: [
                'translateY(0)',
                'translateY(100%)',
            ],
        },
    });
}

export async function fadeIn($element: HTMLElement, duration: number): Promise<void> {
    await animateElement($element, {
        duration,
        styles: { opacity: ['0', '1'] },
    });
}

export async function fadeOut($element: HTMLElement, duration: number): Promise<void> {
    await animateElement($element, {
        duration,
        styles: { opacity: ['1', '0'] },
    });
}
