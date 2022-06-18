import { after, arrayFirst, arrayReplace, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import { markRaw, nextTick } from 'vue';
import type { Component } from 'vue';

import ConfirmModal from '@/framework/components/ConfirmModal.vue';
import Errors from '@/framework/core/facades/Errors';
import LoadingModal from '@/framework/components/LoadingModal.vue';
import MarkdownModal from '@/framework/components/MarkdownModal.vue';
import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import ErrorReportModal from '@/components/modals/ErrorReportModal.vue';

interface State {
    headerHeight: number;
    loadingModal: Modal | null;
    modals: Modal[];
    snackbars: Snackbar[];
    layout: Layout;
}

interface ComputedState {
    isMobile: boolean;
    isDesktop: boolean;
}

interface ModalCallbacks<T=unknown> {
    willClose(result: T | undefined): void;
    closed(result: T | undefined): void;
}

type ModalProps<MC> = MC extends ModalComponent<infer P, unknown> ? P : never;
type ModalResult<MC> = MC extends ModalComponent<Record<string, unknown>, infer R> ? R : never;

const MOBILE_BREAKPOINT = 768;

const enum Layout {
    Mobile = 'mobile',
    Desktop = 'desktop'
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

export interface ConfirmOptions {
    message: string;
    acceptText: string;
    cancelText: string;
}

export interface RunOperationOptions {
    blocking: boolean;
    loadingMessage: string;
    successMessage: string;
}

export type ModalCloseCallback<Result = unknown> = (result: Result) => void;

export const enum ApplicationComponent {
    ConfirmModal = 'confirm-modal',
    ErrorReportModal = 'error-report-modal',
    LoadingModal = 'loading-modal',
    MarkdownModal = 'markdown-modal',
    NotFound = 'not-found',
}

export default class UIService extends Service<State, ComputedState> {

    private modalCallbacks: Record<string, Partial<ModalCallbacks>> = {};
    private components: Record<ApplicationComponent, Component> = {
        [ApplicationComponent.ConfirmModal]: markRaw(ConfirmModal),
        [ApplicationComponent.ErrorReportModal]: markRaw(ErrorReportModal),
        [ApplicationComponent.LoadingModal]: markRaw(LoadingModal),
        [ApplicationComponent.MarkdownModal]: markRaw(MarkdownModal),
        [ApplicationComponent.NotFound]: markRaw(NotFound),
    };

    public async confirm(options: Partial<ConfirmOptions> = {}): Promise<boolean> {
        const modal = await this.openModal(this.components[ApplicationComponent.ConfirmModal], options);
        const result = await modal.afterClose;

        return !!result;
    }

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

        this.setState({ modals: this.modals.concat(modal) });

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

    public async runOperation(
        operation: () => Promise<unknown>,
        options: Partial<RunOperationOptions> = {},
    ): Promise<void> {
        try {
            options.blocking && this.showLoading(options.loadingMessage);

            await operation();

            options.successMessage && this.showSnackbar(options.successMessage);
        } catch (error) {
            Errors.report(error);
        } finally {
            options.blocking && this.hideLoading();
        }
    }

    public async showMarkdown(content: string): Promise<void>;
    public async showMarkdown(title: string, content: string): Promise<void>;
    public async showMarkdown(titleOrContent: string, content?: string): Promise<void> {
        const title = typeof content === 'string' ? titleOrContent : null;

        content = content ?? titleOrContent;

        await this.openModal(this.components[ApplicationComponent.MarkdownModal], { title, content });
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

    public async showLoading(text?: string): Promise<void> {
        if (this.loadingModal) {
            this.loadingModal.props.text = text;

            return;
        }

        this.loadingModal = await this.openModal(this.components[ApplicationComponent.LoadingModal], { text });
    }

    public async hideLoading(): Promise<void> {
        const loadingModal = this.loadingModal;

        if (!loadingModal)
            return;

        this.loadingModal = null;

        await this.closeModal(loadingModal.id);
    }

    public resolveComponent(name: ApplicationComponent): Component {
        return this.components[name];
    }

    public registerComponent(name: ApplicationComponent, component: Component): void {
        this.components[name] = markRaw(component);
    }

    public updateHeaderHeight(height: number): void {
        this.setState({ headerHeight: height });
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.watchWindowMedia();
    }

    protected getInitialState(): State {
        return {
            headerHeight: 0,
            loadingModal: null,
            modals: [],
            snackbars: [],
            layout: this.getCurrentLayout(),
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            isMobile: ({ layout }) => layout === Layout.Mobile,
            isDesktop: ({ layout }) => layout === Layout.Desktop,
        };
    }

    protected getCurrentLayout(): Layout {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            return Layout.Desktop;
        }

        return Layout.Mobile;
    }

    protected watchWindowMedia(): void {
        const media = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
        const updateState = () => this.setState({ layout: this.getCurrentLayout() });

        media.addEventListener('change', updateState);

        updateState();
    }

}

export default interface UIService extends IService<State, ComputedState> {}
