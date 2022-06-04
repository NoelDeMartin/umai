import { animateElements, requireChildElement } from '@/framework/utils/dom';

export async function bodySlideDown($root: HTMLElement, duration: number): Promise<void> {
    const $body = requireChildElement($root, '.recipe-page--body');
    const $metadataDecoration = requireChildElement($root, '.recipe-page--metadata-decoration');
    const bodyBoundingRect = $body.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $body,
            styles: {
                transform: [
                    'translateY(0)',
                    `translateY(${
                        window.innerHeight - bodyBoundingRect.top + $metadataDecoration.clientHeight
                    }px)`,
                ],
            },
        },
    ]);
}

export async function bodySlideUp($root: HTMLElement, duration: number): Promise<void> {
    const $body = requireChildElement($root, '.recipe-page--body');
    const $metadataDecoration = requireChildElement($root, '.recipe-page--metadata-decoration');
    const bodyBoundingRect = $body.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $body,
            before: { addClasses: 'z-30' },
            after: { removeClasses: 'z-30' },
            styles: {
                transform: [
                    `translateY(${
                        window.innerHeight - bodyBoundingRect.top + $metadataDecoration.clientHeight
                    }px)`,
                    'translateY(0)',
                ],
            },
        },
    ]);
}

export async function headerDelay($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');

    await animateElements({ duration }, [
        {
            element: $header,
            before: { addClasses: 'opacity-0' },
            after: { removeClasses: 'opacity-0' },
        },
    ]);
}

export async function headerSlideDown($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');

    await animateElements({ duration }, [
        {
            element: $header,
            styles: {
                transform: [
                    'translateY(-100%)',
                    'translateY(0)',
                ],
            },
        },
    ]);
}

export async function headerSlideUp($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');

    await animateElements({ duration }, [
        {
            element: $header,
            styles: {
                transform: [
                    'translateY(0)',
                    'translateY(-100%)',
                ],
            },
        },
    ]);
}
