import { after, arrayFirst, arrayReplace, uuid } from '@noeldemartin/utils';
import { markRaw, nextTick } from 'vue';
import type { Component } from 'vue';

import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    components: Record<ApplicationComponents, Component>;
    headerHeight: number;
    modals: Modal[];
}

export interface Modal {
    id: string;
    component: Component;
    open: boolean;
}

export const enum ApplicationComponents {
    NotFound = 'not-found',
}

export default class UIService extends Service {

    public async openModal(component: Component): Promise<string> {
        const id = uuid();
        const modal: Modal = {
            id,
            open: false,
            component: markRaw(component),
        };

        this.setState({ modals: this.modals.concat([modal]) });

        await nextTick();

        const modals = this.modals.slice(0);
        const modalProxy = modals.find(m => m.id === modal.id);

        arrayReplace(modals, modalProxy, {
            ...modal,
            open: true,
        });

        this.setState({ modals });

        return id;
    }

    public async closeModal(id: string, force: boolean = false): Promise<void> {
        const modal = arrayFirst(this.modals, modal => modal.id === id);

        if (!modal)
            return;

        const modals = this.modals.slice(0);

        if (!force) {
            const modalProxy = modals.find(m => m.id === modal.id);


            arrayReplace(modals, modalProxy, {
                ...modal,
                open: false,
            });

            this.setState({ modals });

            await after({ milliseconds: 1000 });
        }

        this.setState({ modals: modals.filter(m => m.id !== modal.id) });
    }

    public registerComponent(name: ApplicationComponents, component: Component): void {
        this.components[name] = component;
    }

    public updateHeaderHeight(height: number): void {
        this.setState({ headerHeight: height });
    }

    protected getInitialState(): State {
        return {
            components: {
                [ApplicationComponents.NotFound]: NotFound,
            },
            headerHeight: 0,
            modals: [],
        };
    }

}

export default interface UIService extends IService<State> {}
