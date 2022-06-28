import { PromisedValue, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import { markRaw, nextTick } from 'vue';
import type { Component } from 'vue';

import ConfirmModal from '@/framework/components/ConfirmModal.vue';
import Errors from '@/framework/core/facades/Errors';
import Events from '@/framework/core/facades/Events';
import LoadingModal from '@/framework/components/LoadingModal.vue';
import MarkdownModal from '@/framework/components/MarkdownModal.vue';
import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import ErrorReportModal from '@/components/modals/ErrorReportModal.vue';

interface State {
    headerHeight: number;
    loadingModal: PromisedValue<Modal> | null;
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

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'modal-will-close': { modal: Modal; result?: unknown };
        'modal-closed': { modal: Modal; result?: unknown };
        'close-modal': { id: string; result?: unknown };
        'hide-modal': { id: string };
        'show-modal': { id: string };
        'show-overlays-backdrop': void;
        'hide-overlays-backdrop': void;
    }

}

export interface Modal<T = unknown> {
    id: string;
    props: Record<string, unknown>;
    component: Component;
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
            component: markRaw(component),
            beforeClose: new Promise(resolve => callbacks.willClose = resolve),
            afterClose: new Promise(resolve => callbacks.closed = resolve),
        };
        const activeModal = this.modals.at(-1);
        const modals = this.modals.concat(modal);

        this.modalCallbacks[modal.id] = callbacks;

        this.setState({ modals });

        await nextTick();
        await (activeModal && Events.emit('hide-modal', { id: activeModal.id }));
        await Promise.all([
            activeModal || Events.emit('show-overlays-backdrop'),
            Events.emit('show-modal', { id: modal.id }),
        ]);

        return modal;
    }

    public async closeModal(id: string, result?: unknown): Promise<void> {
        await Events.emit('close-modal', { id, result });
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
            const loadingModal = await this.loadingModal;

            loadingModal.props.text = text;

            return;
        }

        this.loadingModal = new PromisedValue();

        this.loadingModal.resolve(
            await this.openModal(this.components[ApplicationComponent.LoadingModal], { text }),
        );
    }

    public async hideLoading(): Promise<void> {
        if (!this.loadingModal) {
            return;
        }

        const loadingModal = await this.loadingModal;

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
        this.watchModalEvents();
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

    private watchModalEvents(): void {
        Events.on('modal-will-close', ({ modal, result }) => {
            this.modalCallbacks[modal.id]?.willClose?.(result);

            if (this.modals.length === 1) {
                Events.emit('hide-overlays-backdrop');
            }
        });

        Events.on('modal-closed', async ({ modal, result }) => {
            this.setState({ modals: this.modals.filter(m => m.id !== modal.id) });

            this.modalCallbacks[modal.id]?.closed?.(result);

            delete this.modalCallbacks[modal.id];

            const activeModal = this.modals.at(-1);

            await (activeModal && Events.emit('show-modal', { id: activeModal.id }));
        });
    }

}

export default interface UIService extends IService<State, ComputedState> {}
