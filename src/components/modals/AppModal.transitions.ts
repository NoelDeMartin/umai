import { fadeIn, fadeOut, scaleDown, scaleUp } from '@/framework/utils/transitions';
import { requireChildElement } from '@/framework/utils/dom';

export async function hideModal($root: HTMLElement, duration: number): Promise<void> {
    const $panel = requireChildElement($root, '.app-modal--panel');

    await Promise.all([
        fadeOut($panel, { duration, easing: 'ease-in' }),
        scaleDown($panel, { duration, easing: 'ease-in' }),
    ]);

    $root.classList.add('opacity-0');
    $root.classList.add('pointer-events-none');
}

export async function showModal($root: HTMLElement, duration: number): Promise<void> {
    const $panel = requireChildElement($root, '.app-modal--panel');

    $root.classList.remove('opacity-0');
    $root.classList.remove('pointer-events-none');

    await Promise.all([
        fadeIn($panel, { duration, easing: 'ease-out' }),
        scaleUp($panel, { duration, easing: 'ease-out' }),
    ]);
}
