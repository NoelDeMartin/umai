import { afterAnimationFrame, arrayRemove, tap } from '@noeldemartin/utils';
import { nextTick } from 'vue';

import Service from '@/framework/core/Service';
import { afterElementsUpdated, hideElement, resetElement, updateElement } from '@/framework/utils/dom';

type EnterTransition = (element: HTMLElement) => Promise<void>;
type LeaveTransition = (wrapper: HTMLElement, element: HTMLElement) => Promise<void>;
type ElementTransition = (wrapper: HTMLElement, source: HTMLElement, target: HTMLElement) => Promise<void>;

interface ElementTransitionTarget {
    element: HTMLElement;
    transition: ElementTransition;
}

interface TransitionalElementConfig {
    id?: string;
    name?: string;
    transitions: Partial<Record<string, ElementTransition>> & {
        enter?: EnterTransition;
        leave?: LeaveTransition;
    };
}

export const defineEnterTransition = (transition: EnterTransition): EnterTransition => transition;
export const defineLeaveTransition = (transition: LeaveTransition): LeaveTransition => transition;
export const defineElementTransition = (transition: ElementTransition): ElementTransition => transition;

export default class ElementTransitionsService extends Service {

    private activeElements: HTMLElement[] = [];
    private elementsChildren: WeakMap<HTMLElement, HTMLElement[]> = new WeakMap;
    private elementsConfig: WeakMap<HTMLElement, TransitionalElementConfig> = new WeakMap;
    private elementsSourceTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private elementsTargetTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;

    public async afterChildrenTransitions(element: HTMLElement): Promise<void> {
        const children = this.elementsChildren.get(element) ?? [];

        await Promise.all(children?.map(element => this.elementsSourceTransitions.get(element)) ?? []);
    }

    public beforeElementMounted(element: HTMLElement, config: TransitionalElementConfig): void {
        this.elementsConfig.set(element, config);
        this.elementsChildren.set(element, []);
    }

    public async elementMounted(element: HTMLElement): Promise<void> {
        const config = this.elementsConfig.get(element);

        if (!config)
            return;

        this.activeElements.push(element);
        this.registerElementHierarchy(element);
        hideElement(element);

        await afterElementsUpdated();
        await nextTick();
        await this.elementsTargetTransitions.get(element);

        resetElement(element);

        await config.transitions.enter?.call(null, element);
    }

    public beforeElementUnmounted(element: HTMLElement): void {
        if (!this.activeElements.includes(element))
            return;

        this.removeElement(element, this.elementsConfig.get(element) as TransitionalElementConfig);
    }

    private registerElementHierarchy(element: HTMLElement): void {
        let parent = element.parentElement;

        while (parent !== null) {
            this.elementsChildren.get(parent)?.push(element);

            parent = parent.parentElement;
        }
    }

    private async removeElement(element: HTMLElement, config: TransitionalElementConfig): Promise<void> {
        arrayRemove(this.activeElements, element);

        const wrapper = await this.freezeElement(element);
        const target = this.findElementTarget(config);
        const transitionPromise = !target
            ? (config.transitions.leave ? config.transitions.leave(wrapper, element) : Promise.resolve())
            : tap(target.transition(wrapper, element, target.element), transitionPromise => {
                this.elementsTargetTransitions.set(target.element, transitionPromise);
            });

        this.elementsSourceTransitions.set(element, transitionPromise.then(() => wrapper.remove()));
    }

    private findElementTarget(config: TransitionalElementConfig): ElementTransitionTarget | null {
        const targetElement = this.activeElements.find(activeElement => {
            const activeElementConfig = this.elementsConfig.get(activeElement) as TransitionalElementConfig;

            return config.id
                && config.name
                && config.id === activeElementConfig.id
                && config.name in activeElementConfig.transitions;
        });

        if (!targetElement)
            return null;

        const targetConfig = this.elementsConfig.get(targetElement) as TransitionalElementConfig;

        if (!targetConfig || !targetConfig.name || !(targetConfig.name in config.transitions))
            return null;

        return {
            element: targetElement,
            transition: config.transitions[targetConfig.name] as ElementTransition,
        };
    }

    private async freezeElement(element: HTMLElement): Promise<HTMLElement> {
        const boundingRect = element.getBoundingClientRect();
        const wrapper = document.createElement('div');

        await afterAnimationFrame();

        updateElement(wrapper, {
            boundingRect,
            addClasses: 'fixed',
            append: element,
        });

        document.body.append(wrapper);

        return wrapper;
    }

}
