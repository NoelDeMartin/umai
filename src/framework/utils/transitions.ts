import { animateElement } from '@/framework/utils/dom';

type TransitionOptions = {
    duration: number;
    easing?: 'ease-in' | 'ease-out';
    fill?: FillMode;
};
type TransitionConfig = number | TransitionOptions;

function animationOptions(config: TransitionConfig): TransitionOptions {
    if (typeof config !== 'number') {
        return config;
    }

    return { duration: config };
}

export async function delay($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        before: { styles: { opacity: '0' } },
        after: { resetStyles: true },
    });
}

export async function fadeIn($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: { opacity: ['0', '1'] },
    });
}

export async function fadeOut($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: { opacity: ['1', '0'] },
    });
}

export async function grow($element: HTMLElement, config: TransitionConfig): Promise<void> {
    const height = $element.clientHeight;

    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            height: [
                '0px',
                `${height}px`,
            ],
        },
    });
}

export async function scaleDown($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            transform: [
                'scale(1)',
                'scale(.95)',
            ],
        },
    });
}

export async function scaleUp($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            transform: [
                'scale(.95)',
                'scale(1)',
            ],
        },
    });
}

export async function shrink($element: HTMLElement, config: TransitionConfig): Promise<void> {
    const height = $element.clientHeight;

    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            height: [
                `${height}px`,
                '0px',
            ],
        },
    });
}

export async function slideUp($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            transform: [
                'translateY(100%)',
                'translateY(0)',
            ],
        },
    });
}

export async function slideDown($element: HTMLElement, config: TransitionConfig): Promise<void> {
    await animateElement($element, {
        ...animationOptions(config),
        styles: {
            transform: [
                'translateY(0)',
                'translateY(100%)',
            ],
        },
    });
}
