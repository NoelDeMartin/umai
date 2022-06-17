import TailwindCSS from '@/framework/utils/tailwindcss';
import { animateElements, requireChildElement } from '@/framework/utils/dom';
import { delay } from '@/framework/utils/transitions';

export async function bodySlideDown($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');
    const $body = requireChildElement($root, '.recipe-page--body');
    const $metadataDecoration = requireChildElement($root, '.recipe-page--metadata-decoration');
    const bodyBoundingRect = $body.getBoundingClientRect();
    const headerBoundingRect = $header.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $body,
            before: {
                addClasses: 'z-20 fixed w-full',
                styles: {
                    height: Math.max(
                        bodyBoundingRect.height,
                        window.innerHeight - headerBoundingRect.height,
                    ) + 'px',
                },
            },
            styles: {
                top: [
                    `${bodyBoundingRect.top}px`,
                    `${window.innerHeight + $metadataDecoration.clientHeight}px`,
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

    await delay($header, duration);
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

interface HeaderToCardOptions {
    $headerTitle: HTMLElement;
    $headerTitleText: HTMLElement;
    $card: HTMLElement;
    duration: number;
    withoutHeaderOverlay?: boolean;
}

export async function headerToCard(
    $root: HTMLElement,
    {
        duration,
        withoutHeaderOverlay,
        $headerTitle,
        $headerTitleText,
        $card,
    }: HeaderToCardOptions,
): Promise<void>{
    const $header = requireChildElement($root, '.recipe-page--header');
    const $headerWrapper = requireChildElement($root, '.recipe-page--header-wrapper');
    const $headerOverlay = requireChildElement($root, '.recipe-page--header-overlay');
    const $headerTitleWrapper = requireChildElement($root, '.recipe-page--header-title-wrapper');
    const $headerWrapperBackground = document.createElement('div');
    const headerBoundingRect = $header.getBoundingClientRect();
    const headerTitleBoundingRect = $headerTitle.getBoundingClientRect();
    const cardBoundingRect = $card.getBoundingClientRect();

    withoutHeaderOverlay && $headerOverlay.remove();

    $root.classList.remove('overflow-hidden');

    await animateElements({ duration, fill: 'forwards' }, [
        {
            element: $header,
            before: {
                addClasses: 'overflow-hidden z-10 relative',
                removeClasses: 'justify-center',
            },
            classes: { borderRadius: ['rounded-none', 'rounded-lg'] },
            boundingRects: [headerBoundingRect, cardBoundingRect],
        },
        withoutHeaderOverlay
            ? null
            : { element: $headerOverlay, styles: { opacity: [1, 0] } },
        {
            element: $headerWrapper,
            before: {
                removeClasses: 'justify-center pb-4 mx-edge',
                prepend: $headerWrapperBackground,
            },
        },
        {
            element: $headerWrapperBackground,
            before: {
                addClasses: 'opacity-0 absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay',
            },
            styles: { opacity: [0, 1] },
        },
        {
            element: $headerTitleWrapper,
            before: {
                addClasses: 'w-full flex-shrink-0',
                removeClasses: 'pr-36 max-w-readable',
            },
        },
        {
            element: $headerTitle,
            before: { addClasses: 'relative w-full' },
            classes: {
                paddingTop: ['p-4', 'p-2'],
                paddingRight: ['p-4', 'p-2'],
                paddingBottom: ['p-4', 'p-2'],
                textShadow: ['text-shadow', 'text-shadow-transparent'],
                fontSize: ['text-4xl', 'text-lg'],
            },
            styles: {
                paddingLeft: [
                    `${headerTitleBoundingRect.left}px`,
                    TailwindCSS.css('spacing.2'),
                ],
            },
        },
        {
            element: $headerTitleText,
            before: { addClasses: 'relative' },
        },
    ]);
}
