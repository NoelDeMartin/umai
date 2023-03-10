import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import { requireChildElement } from '@/framework/utils/dom';
import type { AnimationConfig } from '@/framework/utils/dom';

export function createRecipeTitleElement(title: string): HTMLElement {
    const $root = document.createElement('h1');
    const $text = document.createElement('span');

    $root.setAttribute('class', 'text-2xl font-semibold text-white text-shadow md:text-4xl');
    $root.append($text);
    $text.setAttribute('class', 'recipe-title--text');
    $text.innerText = title;

    return $root;
}

export function recipeTitleToCardTitleAnimations($root: HTMLElement): AnimationConfig[] {
    const $text = requireChildElement($root, '.recipe-title--text');
    const boundingRect = $root.getBoundingClientRect();

    return [
        {
            element: $root,
            before: { addClasses: 'relative w-full' },
            classes: {
                paddingTop: ['p-4', 'p-2'],
                paddingRight: ['p-4', 'p-2'],
                paddingBottom: ['p-4', 'p-2'],
                textShadow: ['text-shadow', 'text-shadow-transparent'],
                fontSize: [UI.isMobile ? 'text-2xl' : 'text-4xl', 'text-lg'],
            },
            styles: {
                paddingLeft: [
                    `${boundingRect.left}px`,
                    TailwindCSS.css('spacing.2'),
                ],
                paddingRight: [
                    `${window.innerWidth - boundingRect.right}px`,
                    TailwindCSS.css('spacing.2'),
                ],
            },
        },
        {
            element: $text,
            before: { addClasses: 'relative' },
        },
    ];
}
