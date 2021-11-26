import { afterAnimationFrame } from '@noeldemartin/utils';

interface TransitionElementOptions {
    transition: number;
    addClasses: string;
    removeClasses: string;
    boundingRect: DOMRect;
    boundingPosition: DOMRect;
    boundingDimensions: DOMRect;
    styles: Partial<CSSStyleDeclaration>;
    resetStyles: boolean;
    append: HTMLElement;
    prepend: HTMLElement;
}

export async function afterElementsUpdated(): Promise<void> {
    // For some reason, some styles don't transition properly if we don't wait for 2 frames
    // before updating them again.
    await afterAnimationFrame();
    await afterAnimationFrame();
}

export function hasAncestor(element: HTMLElement | null, selector: string): boolean {
    while (element) {
        if (element.matches(selector)) {
            return true;
        }

        element = element.parentElement;
    }

    return false;
}

export function updateElement(element: HTMLElement, options: Partial<TransitionElementOptions>): void {
    options.resetStyles && element.removeAttribute('style');
    options.transition && (element.style.transition = `all ${options.transition}ms`);
    options.styles && Object.assign(element.style, options.styles ?? {});
    options.append && element.append(options.append);
    options.prepend && element.prepend(options.prepend);

    options.addClasses?.split(' ').forEach(addedClass => element.classList.add(addedClass));
    options.removeClasses?.split(' ').forEach(removedClass => element.classList.remove(removedClass));

    if (options.boundingPosition) {
        element.style.top = `${options.boundingPosition.top}px`;
        element.style.left = `${options.boundingPosition.left}px`;
    }

    if (options.boundingDimensions) {
        element.style.width = `${options.boundingDimensions.width}px`;
        element.style.height = `${options.boundingDimensions.height}px`;
    }

    if (options.boundingRect) {
        element.style.top = `${options.boundingRect.top}px`;
        element.style.left = `${options.boundingRect.left}px`;
        element.style.width = `${options.boundingRect.width}px`;
        element.style.height = `${options.boundingRect.height}px`;
    }
}
