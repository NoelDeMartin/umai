import { parseBoolean } from '@noeldemartin/utils';

import {
    defineElementTransition,
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';
import { requireChildElement } from '@/framework/utils/dom';
import { fadeIn, fadeOut, slideDown, slideUp } from '@/framework/utils/transitions';

import {
    bodySlideDown,
    bodySlideUp,
    headerSlideDown,
    headerSlideUp,
    headerToCard,
} from '@/components/recipe/RecipePage.transitions';

export const enterFromDetails = defineEnterTransition(async ($root) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    await Promise.all([
        fadeIn($recipePage, duration),
        slideUp($footer, duration),
    ]);
});

export const enterTransition = defineEnterTransition(async ($root) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $root.classList.add('z-20');
    $root.classList.add('relative');

    await Promise.all([
        bodySlideUp($recipePage, duration),
        headerSlideDown($recipePage, duration),
        slideUp($footer, duration),
    ]);

    $root.classList.remove('z-20');
    $root.classList.remove('relative');
});

export const leaveToDetails = defineLeaveTransition(async ($wrapper, $root) => {
    const duration = 500;
    const $recipePage = requireChildElement($root, '.recipe-form--recipe-page');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $wrapper.classList.add('z-10');

    await Promise.all([
        fadeOut($recipePage, duration),
        slideDown($footer, duration),
    ]);
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
    const $headerTitleTextArea = requireChildElement<HTMLTextAreaElement>($headerTitleLabel, 'textarea');
    const $footer = requireChildElement($root, '.recipe-form--footer');

    $wrapper.classList.add('z-20');
    $headerTitle.setAttribute('class', 'text-4xl font-semibold text-white text-shadow');
    $headerTitle.append($headerTitleText);
    $headerTitleText.innerText = $headerTitleTextArea.value;
    $headerTitleLabel.replaceWith($headerTitle);
    $footer.classList.add('z-20');

    await Promise.all([
        headerToCard(
            $recipePage,
            {
                duration,
                withoutHeaderOverlay: parseBoolean($root.dataset.wasOnboarding),
                $headerTitle,
                $headerTitleText,
                $card,
            },
        ),
        bodySlideDown($recipePage, duration),
        slideDown($footer, duration),
    ]);
});
