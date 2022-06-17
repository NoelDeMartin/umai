import { fail, objectWithoutEmpty, tap } from '@noeldemartin/utils';

interface AnimateElementConfig {
    duration: number;
    fill: FillMode;
    styles: PropertyIndexedKeyframes;
    classes: Partial<Record<keyof CSSStyleDeclaration, string[]>>;
    before: Partial<{
        addClasses: string;
        removeClasses: string;
        append: HTMLElement;
        prepend: HTMLElement;
        styles: Partial<CSSStyleDeclaration>;
    }>;
    after: Partial<{
        addClasses: string;
        removeClasses: string;
        resetStyles: boolean;
    }>;
    boundingRects: DOMRect[];
    boundingPositions: DOMRect[];
    boundingDimensions: DOMRect[];
}

const computedClassStyles: Record<string, string> = {};

function getComputedClassStyle(property: keyof CSSStyleDeclaration, classes: string[]): string[] {
    const styleKeys = classes.map(className => `${className}-${property}`);

    if (styleKeys.some(key => !(key in computedClassStyles))) {
        const div = document.createElement('div');
        const wrapper = document.createElement('div');

        wrapper.style.opacity = '0';
        wrapper.append(div);
        document.body.append(wrapper);

        for (const index in styleKeys) {
            const styleKey = styleKeys[index] as string;
            const className = classes[index] as string;

            if (styleKey in computedClassStyles)
                continue;

            div.classList.add(className);

            computedClassStyles[styleKey] = getComputedStyle(div)[property] as string;

            div.classList.remove(className);
        }

        wrapper.remove();
    }

    return styleKeys.map(key => computedClassStyles[key] as string);
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

export function measureHTMLDimensions(html: string): { width: number; height: number } {
    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.opacity = '0';
    ruler.innerHTML = html;

    document.body.append(ruler);

    return tap({ width: ruler.clientWidth, height: ruler.clientHeight }, () => ruler.remove());
}

export async function afterAnimationTime(duration: number): Promise<void> {
    await animateElement(document.createElement('div'), { duration });
}

export async function animateElement(element: HTMLElement, config: Partial<AnimateElementConfig>): Promise<void> {
    config.before?.addClasses?.split(' ').forEach(addedClass => element.classList.add(addedClass));
    config.before?.removeClasses?.split(' ').forEach(removedClass => element.classList.remove(removedClass));
    config.before?.append && element.append(config.before.append);
    config.before?.prepend && element.prepend(config.before.prepend);
    config.before?.styles && Object.assign(element.style, config.before.styles);

    const animation = element.animate(
        objectWithoutEmpty({
            top: (config.boundingRects ?? config.boundingPositions)?.map(rect => `${rect.top}px`),
            left: (config.boundingRects ?? config.boundingPositions)?.map(rect => `${rect.left}px`),
            width: (config.boundingRects ?? config.boundingDimensions)?.map(rect => `${rect.width}px`),
            height: (config.boundingRects ?? config.boundingDimensions)?.map(rect => `${rect.height}px`),
            ...Object.entries(config.classes ?? {})?.reduce((styles, [property, classes]) => {
                styles[property] = getComputedClassStyle(property as keyof CSSStyleDeclaration, classes as string[]);

                return styles;
            }, {} as PropertyIndexedKeyframes),
            ...config.styles,
        }),
        { duration: config.duration, fill: config.fill },
    );

    await animation.finished;

    config.after?.addClasses?.split(' ').forEach(addedClass => element.classList.add(addedClass));
    config.after?.removeClasses?.split(' ').forEach(removedClass => element.classList.remove(removedClass));
    config.after?.resetStyles && element.removeAttribute('style');
}

export async function animateElements(
    sharedConfig: Partial<AnimateElementConfig>,
    animations: ((Partial<AnimateElementConfig> & { element: HTMLElement }) | null)[],
): Promise<void> {
    await Promise.all(
        Object
            .values(animations)
            .filter((animation): animation is Partial<AnimateElementConfig> & { element: HTMLElement } => !!animation)
            .map(({ element, ...config }) => animateElement(element, { ...sharedConfig, ...config })),
    );
}

export function elementIsInViewport(element: HTMLElement): boolean {
    const clientRect = element.getBoundingClientRect();

    return clientRect.top >= 0
        && clientRect.left >= 0
        && clientRect.bottom <= window.innerHeight
        && clientRect.right <= window.innerWidth;
}

export function requireChildElement<T extends HTMLElement = HTMLElement>(parent: HTMLElement, selector: string): T {
    return parent.querySelector(selector) ?? fail(`Could not find child element with '${selector}' selector`);
}
