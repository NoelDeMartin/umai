import { afterAnimationFrame, arr, tap, toString } from '@noeldemartin/utils';
import { nextTick } from 'vue';

import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

interface ElementData {
    element: HTMLElement;
    config: TransitionalElementConfig;
}

interface ElementTransitionData extends ElementData {
    transition: ElementTransition;
}

export const defineEnterTransition = (transition: EnterTransition): EnterTransition => transition;
export const defineLeaveTransition = (transition: LeaveTransition): LeaveTransition => transition;
export const defineElementTransition = (transition: ElementTransition): ElementTransition => transition;

export type EnterTransition = (element: HTMLElement, previous?: ElementData) => Promise<void>;
export type LeaveTransition = (wrapper: HTMLElement, element: HTMLElement) => Promise<void>;
export type ElementTransition = (wrapper: HTMLElement, source: HTMLElement, target: ElementData) => Promise<void>;

export interface TransitionalElementConfig {
    id?: string;
    name?: string;
    blocking?: boolean | ((targetConfig: TransitionalElementConfig, target: HTMLElement) => boolean);
    transitions: Partial<Record<string, ElementTransition>> & {
        enter?: Record<string, EnterTransition>;
        leave?: Record<string, LeaveTransition>;
    };
}

export interface GlobalElementTransitions {
    fadeIn: EnterTransition;
    fadeOut: LeaveTransition;
    waitChildrenTransitions: LeaveTransition;
}

export default interface ElementTransitionsService extends GlobalElementTransitions {}
export default class ElementTransitionsService extends Service {

    private activeElements: Set<HTMLElement> = new Set();
    private elementsLeaving: Set<HTMLElement> = new Set();
    private elementsChildren: WeakMap<HTMLElement, HTMLElement[]> = new WeakMap;
    private elementsConfig: WeakMap<HTMLElement, TransitionalElementConfig> = new WeakMap;
    private elementsSourceTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private elementsTargetTransitions: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private elementsTarget: WeakMap<HTMLElement, HTMLElement> = new WeakMap;
    private elementsReady: WeakMap<HTMLElement, Promise<void>> = new WeakMap;
    private elementsFreezingInPlace: WeakMap<HTMLElement, void> = new WeakMap;
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

    public freezeInPlace(element: HTMLElement): void {
        this.elementsFreezingInPlace.set(element);
    }

    public registerElementConfig(element: HTMLElement, config: TransitionalElementConfig): void {
        this.elementsConfig.set(element, config);
        this.elementsChildren.set(element, []);
    }

    public updateElementConfig(element: HTMLElement, config: TransitionalElementConfig): void {
        this.elementsConfig.set(element, config);
    }

    public async showElement(element: HTMLElement): Promise<void> {
        const config = this.elementsConfig.get(element);

        if (!config)
            return;

        this.activeElements.add(element);
        this.registerElementHierarchy(element);

        await tap(this.addElement(element), enterPromise => this.elementsReady.set(element, enterPromise));
    }

    public async hideElement(element: HTMLElement): Promise<void> {
        if (!this.activeElements.has(element))
            return;

        this.activeElements.delete(element);
        this.elementsLeaving.add(element);
        this.removeElement(element, this.requireElementConfig(element)).then(() => {
            this.elementsLeaving.delete(element);
        });
    }

    public async waitElementsGone(name: string): Promise<void> {
        name;

        // TODO
    }

    public async waitElementsReady(name: string): Promise<void> {
        await Promise.all(
            arr(this.activeElements)
                .filter(el => this.elementsConfig.get(el)?.name === name)
                .map(el => this.elementsReady.get(el)),
        );
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        this.defineGlobalEnterTransition('fadeIn', element => fadeIn(element, 700));
        this.defineGlobalLeaveTransition('fadeOut', wrapper => fadeOut(wrapper, 700));
        this.defineGlobalLeaveTransition('waitChildrenTransitions', async (_, element) => {
            const children = this.elementsChildren.get(element) ?? [];

            if (children.length > 0)
                await nextTick();

            await Promise.all(children.map(element => this.elementsSourceTransitions.get(element)) ?? []);
        });
    }

    protected __get(name: string): unknown {
        return this.transitions[name];
    }

    private requireElementConfig(element: HTMLElement): TransitionalElementConfig {
        return this.elementsConfig.get(element) ?? fail('Couldn\'t get required element config');
    }

    private registerElementHierarchy(element: HTMLElement): void {
        let parent = element.parentElement;

        while (parent !== null) {
            this.elementsChildren.get(parent)?.push(element);

            parent = parent.parentElement;
        }
    }

    private async addElement(element: HTMLElement): Promise<void> {
        if (!Router.hasNavigated())
            return;

        element.style.opacity = '0';

        await nextTick();
        await this.elementsTargetTransitions.get(element);

        element.removeAttribute('style');

        await this.runEnterElementTransition(element);
    }

    private async removeElement(element: HTMLElement, config: TransitionalElementConfig): Promise<void> {
        const wrapper = await this.freezeElement(element);

        if (!wrapper)
            return;

        const target = this.findElementTarget(element, config);
        const transitionPromise = target
            ? this.runElementTransition(wrapper, element, config, target)
            : this.runLeaveElementTransition(wrapper, element);

        this.elementsSourceTransitions.set(element, transitionPromise);

        await transitionPromise;

        wrapper.remove();
    }

    private findElementTarget(element: HTMLElement, config: TransitionalElementConfig): ElementTransitionData | null {
        const targetElement = this.elementsTarget.get(element) ??
            arr(this.activeElements).find(activeElement => {
                const activeElementConfig = this.requireElementConfig(activeElement);

                return this.isTargetConfig(activeElementConfig, config);
            });

        if (!targetElement)
            return null;

        const targetConfig = this.requireElementConfig(targetElement);

        if (!targetConfig || !targetConfig.name || !(targetConfig.name in config.transitions))
            return null;

        this.elementsTarget.set(element, targetElement);

        return {
            element: targetElement,
            config: targetConfig,
            transition: config.transitions[targetConfig.name] as ElementTransition,
        };
    }

    private isTargetConfig(
        activeConfig: TransitionalElementConfig,
        enteringConfig: TransitionalElementConfig,
    ): boolean {
        return !!enteringConfig.id
            && !!enteringConfig.name
            && enteringConfig.id === activeConfig.id
            && enteringConfig.name in activeConfig.transitions;
    }

    private async freezeElement(element: HTMLElement): Promise<HTMLElement | void> {
        const boundingRect = element.getBoundingClientRect();

        await afterAnimationFrame();

        return this.elementsFreezingInPlace.has(element)
            ? this.freezeElementInPlace(element, boundingRect)
            : this.freezeElementInWrapper(element, boundingRect);
    }

    private freezeElementInPlace(element: HTMLElement, boundingRect: DOMRect): void {
        element.style.width = `${boundingRect.width}px`;
        element.style.height = `${boundingRect.height}px`;
    }

    private freezeElementInWrapper(element: HTMLElement, boundingRect: DOMRect): HTMLElement {
        const wrapper = document.createElement('div');

        wrapper.classList.add('element-transitions-wrapper');
        wrapper.style.position = 'fixed';
        wrapper.style.top = `${boundingRect.top}px`;
        wrapper.style.left = `${boundingRect.left}px`;
        wrapper.style.width = `${boundingRect.width}px`;
        wrapper.style.height = `${boundingRect.height}px`;

        wrapper.append(element);

        (document.getElementById('element-transitions-container') ?? document.body).append(wrapper);

        return wrapper;
    }

    private async runEnterElementTransition(element: HTMLElement): Promise<void> {
        const config = this.requireElementConfig(element);
        const previous = arr(this.elementsLeaving)
            .map(element => ({ element, config: this.requireElementConfig(element) }))
            .find(({ config: leavingConfig }) => this.isTargetConfig(leavingConfig, config));

        previous && this.elementsTarget.set(previous.element, element);

        if (!config.transitions.enter)
            return;

        const previousRouteName = Router.previousRoute ? toString(Router.previousRoute.name) : null;
        const enterTransition = previousRouteName && previousRouteName in config.transitions.enter
            ? config.transitions.enter[previousRouteName]
            : config.transitions.enter['*'];

        if (!enterTransition)
            return;

        await enterTransition(element, previous);
    }

    private async runLeaveElementTransition(wrapper: HTMLElement, element: HTMLElement): Promise<void> {
        const config = this.requireElementConfig(element);

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
        config: TransitionalElementConfig,
        target: ElementTransitionData,
    ): Promise<void> {
        const blocking = typeof config.blocking === 'function'
            ? config.blocking(target.config, target.element)
            : config.blocking ?? false;

        return tap(target.transition(wrapper, element, target), transitionPromise => {
            blocking && this.elementsTargetTransitions.set(target.element, transitionPromise);
        });
    }

}
