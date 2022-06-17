import {
    defineElementTransition,
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';
import { requireChildElement } from '@/framework/utils/dom';
import { slideDown, slideUp } from '@/framework/utils/transitions';

import {
    bodySlideDown,
    bodySlideUp,
    headerSlideDown,
    headerSlideUp,
    headerToCard,
} from '@/components/recipe/RecipePage.transitions';

export const enterTransition = defineEnterTransition(async ($root) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $root.classList.add('z-20');
    $root.classList.add('relative');
    $footer.classList.add('z-30');

    await Promise.all([
        bodySlideUp($recipePage, duration),
        headerSlideDown($recipePage, duration),
        slideUp($footer, duration),
    ]);

    $root.classList.remove('z-20');
    $root.classList.remove('relative');
    $footer.classList.remove('z-30');
});

export const leaveTransition = defineLeaveTransition(async ($wrapper, $root) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $wrapper.classList.add('z-10');
    $root.classList.add('z-20');
    $root.classList.add('relative');
    $footer.classList.add('z-20');

    await Promise.all([
        bodySlideDown($recipePage, duration),
        headerSlideUp($recipePage, duration),
        slideDown($footer, duration),
    ]);
});

export const transitionToCard = defineElementTransition(async ($wrapper, $root, { element: $card }) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $headerTitle = document.createElement('div');
    const $headerTitleText = document.createElement('span');
    const $headerTitleLabel = requireChildElement($root, '.recipe-form--title-label');
    const $headerTitleInput = requireChildElement<HTMLInputElement>($headerTitleLabel, 'input');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $wrapper.classList.add('z-20');
    $headerTitle.setAttribute('class', 'text-4xl font-semibold text-white text-shadow');
    $headerTitle.append($headerTitleText);
    $headerTitleText.innerText = $headerTitleInput.value;
    $headerTitleLabel.replaceWith($headerTitle);
    $footer.classList.add('z-20');

    await Promise.all([
        headerToCard($recipePage, $headerTitle, $headerTitleText, $card, duration),
        bodySlideDown($recipePage, duration),
        slideDown($footer, duration),
    ]);
});
