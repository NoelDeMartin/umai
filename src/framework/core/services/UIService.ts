import { after, arrayFirst, arrayReplace, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import { markRaw, nextTick } from 'vue';
import type { Component } from 'vue';

import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    components: Record<ApplicationComponents, Component>;
    headerHeight: number;
    modals: Modal[];
    snackbars: Snackbar[];
}

type ModalProps<MC> = MC extends ModalComponent<infer P, unknown> ? P : never;
type ModalResult<MC> = MC extends ModalComponent<Record<string, unknown>, infer R> ? R : never;

interface ModalCallbacks<T=unknown> {
    willClose(result: T | undefined): void;
    closed(result: T | undefined): void;
}

export interface Modal<T = unknown> {
    id: string;
    props: Record<string, unknown>;
    component: Component;
    open: boolean;
    beforeClose: Promise<T | undefined>;
    afterClose: Promise<T | undefined>;
}

export interface Snackbar {
    id: string;
    message: string;
    actions: SnackbarAction[];
}

export interface SnackbarAction {
    text: string;
    handler(): void;
}

export interface ModalComponent<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Props extends Record<string, unknown> = Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Result = unknown
> {}

export type ModalCloseCallback<Result = unknown> = (result: Result) => void;

export const enum ApplicationComponents {
    NotFound = 'not-found',
}

export default class UIService extends Service {

    private modalCallbacks: Record<string, Partial<ModalCallbacks>> = {};

    public async openModal<MC extends ModalComponent>(
        component: MC,
        props?: ModalProps<MC>,
    ): Promise<Modal<ModalResult<MC>>> {
        const id = uuid();
        const callbacks: Partial<ModalCallbacks<ModalResult<MC>>> = {};
        const modal: Modal<ModalResult<MC>> = {
            id,
            props: props ?? {},
            open: false,
            component: markRaw(component),
            beforeClose: new Promise(resolve => callbacks.willClose = resolve),
            afterClose: new Promise(resolve => callbacks.closed = resolve),
        };

        this.modalCallbacks[id] = callbacks;

        this.setState({ modals: this.modals.concat([modal]) });

        await nextTick();

        const modals = this.modals.slice(0);
        const modalProxy = modals.find(m => m.id === modal.id);

        arrayReplace(modals, modalProxy, {
            ...modal,
            open: true,
        });

        this.setState({ modals });

        return modal;
    }

    public async closeModal(id: string, result?: unknown, animate: boolean = true): Promise<void> {
        const modal = arrayFirst(this.modals, modal => modal.id === id);

        if (!modal)
            return;

        const callbacks = this.modalCallbacks[id];

        delete this.modalCallbacks[id];

        callbacks?.willClose && callbacks.willClose(result);

        if (animate) {
            const modals = this.modals.slice(0);
            const modalProxy = modals.find(m => m.id === modal.id);

            arrayReplace(modals, modalProxy, {
                ...modal,
                open: false,
            });

            this.setState({ modals });

            await after({ milliseconds: 1000 });
        }

        this.setState({ modals: this.modals.filter(m => m.id !== modal.id) });

        callbacks?.closed && callbacks.closed(result);
    }

    public showSnackbar(message: string, actions: SnackbarAction[] = []): string {
        const snackbar: Snackbar = {
            id: uuid(),
            message,
            actions,
        };

        this.setState({
            snackbars: [
                ...this.snackbars,
                snackbar,
            ],
        });

        setTimeout(() => this.hideSnackbar(snackbar.id), 5000);

        return snackbar.id;
    }

    public hideSnackbar(id: string): void {
        const index = this.snackbars.findIndex(snackbar => snackbar.id === id);

        if (index === -1)
            return;

        this.setState({ snackbars: arrayWithoutIndex(this.snackbars, index) });
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
            snackbars: [],
        };
    }

}

export default interface UIService extends IService<State> {}
