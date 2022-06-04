import { animateElements } from '@/framework/utils/dom';

export async function animateItemDeparture($listItem: HTMLElement): Promise<void> {
    const duration = 300;
    const $input = $listItem.firstElementChild as HTMLElement;
    const itemRect = $listItem.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $listItem,
            before: {
                addClasses: 'overflow-hidden relative',
                styles: { width: `${itemRect.width}px` },
            },
            after: {
                removeClasses: 'overflow-hidden relative',
                addClasses: 'hidden',
            },
            styles: {
                height: [`${itemRect.height}px`, '0'],
            },
        },
        {
            element: $input,
            before: {
                addClasses: 'absolute top-0',
                styles: { height: `${itemRect.height}px` },
            },
        },
    ]);
}

export async function animateItemEntrance($listItem: HTMLElement): Promise<void> {
    const duration = 300;
    const $input = $listItem.firstElementChild as HTMLElement;
    const itemRect = $listItem.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $listItem,
            before: { addClasses: 'overflow-hidden relative' },
            after: { removeClasses: 'overflow-hidden relative' },
            styles: {
                height: ['0', `${itemRect.height}px`],
            },
        },
        {
            element: $input,
            before: {
                addClasses: 'absolute top-0',
                styles: {
                    width: `${itemRect.width}px`,
                    height: `${itemRect.height}px`,
                },
            },
            after: {
                removeClasses: 'absolute top-0',
                resetStyles: true,
            },
        },
    ]);
}
