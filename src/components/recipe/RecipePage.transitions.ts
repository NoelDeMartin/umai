import UI from '@/framework/core/facades/UI';
import { animateElements, requireChildElement } from '@/framework/utils/dom';
import { delay } from '@/framework/utils/transitions';

import { recipeTitleToCardTitleAnimations } from '@/components/recipe/RecipeTitle.transitions';

export async function bodySlideDown($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');
    const $body = requireChildElement($root, '.recipe-page--body');
    const $bodyBulge =
        UI.isMobile
            ? requireChildElement($root, '.recipe-page--body-switch')
            : requireChildElement($root, '.recipe-page--metadata-decoration');
    const bodyBoundingRect = $body.getBoundingClientRect();
    const headerBoundingRect = $header.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $body,
            before: {
                addClasses: 'z-20 fixed w-full',
                removeClasses: 'relative',
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
                    `${window.innerHeight + $bodyBulge.clientHeight}px`,
                ],
            },
        },
    ]);
}

export async function bodySlideUp($root: HTMLElement, duration: number): Promise<void> {
    const $body = requireChildElement($root, '.recipe-page--body');
    const $bodyBulge =
        UI.isMobile
            ? requireChildElement($root, '.recipe-page--body-switch')
            : requireChildElement($root, '.recipe-page--metadata-decoration');
    const bodyBoundingRect = $body.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $body,
            before: { addClasses: 'z-30' },
            after: { removeClasses: 'z-30' },
            styles: {
                transform: [
                    `translateY(${
                        window.innerHeight - bodyBoundingRect.top + $bodyBulge.clientHeight
                    }px)`,
                    'translateY(0)',
                ],
            },
        },
    ]);
}

export async function headerDelay($root: HTMLElement, duration: number): Promise<void> {
    const $header = requireChildElement($root, '.recipe-page--header');
    const $image = requireChildElement($root, '.recipe-page--image');

    await Promise.all([
        delay($header, duration),
        delay($image, duration),
    ]);
}

export async function headerSlideDown($root: HTMLElement, duration: number): Promise<void> {
    const $image = requireChildElement($root, '.recipe-page--image');
    const $header = requireChildElement($root, '.recipe-page--header');

    await animateElements({ duration }, [
        {
            element: $image,
            styles: {
                transform: [
                    'translateY(-100%)',
                    'translateY(0)',
                ],
            },
        },
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
    const $image = requireChildElement($root, '.recipe-page--image');
    const $header = requireChildElement($root, '.recipe-page--header');

    await animateElements({ duration }, [
        {
            element: $image,
            styles: {
                transform: [
                    'translateY(0)',
                    'translateY(-100%)',
                ],
            },
        },
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
        $card,
    }: HeaderToCardOptions,
): Promise<void>{
    const $image = requireChildElement($root, '.recipe-page--image');
    const $header = requireChildElement($root, '.recipe-page--header');
    const $headerWrapper = requireChildElement($root, '.recipe-page--header-wrapper');
    const $headerOverlay = requireChildElement($root, '.recipe-page--header-overlay');
    const $headerTitleWrapper = requireChildElement($root, '.recipe-page--header-title-wrapper');
    const $headerTitleFiller = requireChildElement($root, '.recipe-page--header-title-filler');
    const $headerWrapperBackground = document.createElement('div');
    const imageBoundingRect = $image.getBoundingClientRect();
    const cardBoundingRect = $card.getBoundingClientRect();
    const headerTitleAnimations = recipeTitleToCardTitleAnimations($headerTitle);

    withoutHeaderOverlay && $headerOverlay.remove();
    $root.classList.remove('overflow-hidden');
    $headerTitleFiller.remove();

    await animateElements({ duration, fill: 'forwards' }, [
        {
            element: $image,
            before: {
                removeClasses: 'fixed h-52 md:h-80',
                addClasses: 'absolute h-full',
            },
            styles: {
                width: [
                    `${window.innerWidth}px`,
                    `${cardBoundingRect.width}px`,
                ],
            },
        },
        {
            element: $header,
            before: {
                prepend: $image,
                addClasses: 'overflow-hidden z-10 relative',
                removeClasses: 'justify-center',
            },
            classes: { borderRadius: ['rounded-none', 'rounded-lg'] },
            boundingRects: [imageBoundingRect, cardBoundingRect],
        },
        withoutHeaderOverlay
            ? null
            : { element: $headerOverlay, styles: { opacity: [1, 0] } },
        {
            element: $headerWrapper,
            before: {
                removeClasses: 'justify-center pb-4 px-edge',
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
                removeClasses: 'mr-8 md:pr-36 max-w-prose',
            },
        },
        ...headerTitleAnimations,
    ]);
}
