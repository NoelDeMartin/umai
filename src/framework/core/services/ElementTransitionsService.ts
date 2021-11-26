import { afterAnimationFrame, arrayRemove, tap, toString } from '@noeldemartin/utils';
import { nextTick } from 'vue';

import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import { afterElementsUpdated, updateElement } from '@/framework/utils/dom';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

type EnterTransition = (element: HTMLElement, existed: boolean) => Promise<void>;
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
        enter?: Record<string, EnterTransition>;
        leave?: Record<string, LeaveTransition>;
    };
}

export const defineEnterTransition = (transition: EnterTransition): EnterTransition => transition;
export const defineLeaveTransition = (transition: LeaveTransition): LeaveTransition => transition;
export const defineElementTransition = (transition: ElementTransition): ElementTransition => transition;

export interface GlobalElementTransitions {
    fadeIn: EnterTransition;
    fadeOut: LeaveTransition;
    waitChildrenTransitions: LeaveTransition;
}

export default interface ElementTransitionsService extends GlobalElementTransitions {}
export default class ElementTransitionsService extends Service {

    private activeElements: HTMLElement[] = [];
    private elementsChildren: WeakMap<HTMLElement, HTMLElement[]> = new WeakMap;
    private elementsConfig: WeakMap<HTMLElement, TransitionalElementConfig> = new WeakMap;
    private elementsSourceTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private elementsTargetTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private transitions: Record<string, ElementTransition | EnterTransition | LeaveTransition> = {};

    public defineGlobalEnterTransition(name: string, transition: EnterTransition): void {
        this.transitions[name] = transition;
    }

    public defineGlobalLeaveTransition(name: string, transition: LeaveTransition): void {
        this.transitions[name] = transition;
    }

    public defineGlobalElementTransition(name: string, transition: ElementTransition): void {
        this.transitions[name] = transition;
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

        if (!Router.hasNavigated())
            return;

        updateElement(element, { styles: { opacity: '0' } });

        await afterElementsUpdated();
        await nextTick();
        await this.elementsTargetTransitions.get(element);

        updateElement(element, { resetStyles: true });

        await this.runEnterElementTransition(element);
    }

    public beforeElementUnmounted(element: HTMLElement): void {
        if (!this.activeElements.includes(element))
            return;

        this.removeElement(element, this.elementsConfig.get(element) as TransitionalElementConfig);
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        this.defineGlobalEnterTransition('fadeIn', element => fadeIn(element));
        this.defineGlobalLeaveTransition('fadeOut', wrapper => fadeOut(wrapper));
        this.defineGlobalLeaveTransition('waitChildrenTransitions', async (_, element) => {
            const children = this.elementsChildren.get(element) ?? [];

            if (children.length > 0) {
                await afterElementsUpdated();
                await nextTick();
            }

            await Promise.all(children.map(element => this.elementsSourceTransitions.get(element)) ?? []);
        });
    }

    protected __get(name: string): unknown {
        return this.transitions[name];
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
        const transitionPromise = target
            ? this.runElementTransition(wrapper, element, target)
            : this.runLeaveElementTransition(wrapper, element);

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
            addClasses: 'element-transitions-wrapper',
            styles: { position: 'fixed' },
            append: element,
        });

        (document.getElementById('element-transitions-container') ?? document.body).append(wrapper);

        return wrapper;
    }

    private async runEnterElementTransition(element: HTMLElement): Promise<void> {
        const config = this.elementsConfig.get(element) as TransitionalElementConfig;

        if (!config.transitions.enter)
            return;

        const previousRouteName = Router.previousRoute ? toString(Router.previousRoute.name) : null;
        const enterTransition = previousRouteName && previousRouteName in config.transitions.enter
            ? config.transitions.enter[previousRouteName]
            : config.transitions.enter['*'];

        if (!enterTransition)
            return;

        await enterTransition(element, this.elementsTargetTransitions.has(element));
    }

    private async runLeaveElementTransition(wrapper: HTMLElement, element: HTMLElement): Promise<void> {
        const config = this.elementsConfig.get(element) as TransitionalElementConfig;

        if (!config.transitions.leave)
            return;

        const currentRouteName = toString(Router.currentRoute.value.name);
        const leaveTransition = currentRouteName in config.transitions.leave
            ? config.transitions.leave[currentRouteName]
            : config.transitions.leave['*'];

        if (!leaveTransition)
            return;

        await leaveTransition(wrapper, element);
    }

    private runElementTransition(
        wrapper: HTMLElement,
        element: HTMLElement,
        target: ElementTransitionTarget,
    ): Promise<void> {
        return tap(target.transition(wrapper, element, target.element), transitionPromise => {
            this.elementsTargetTransitions.set(target.element, transitionPromise);
        });
    }

}
