import { JSError } from '@noeldemartin/utils';
import { UnsuccessfulNetworkRequestError } from '@noeldemartin/solid-utils';

import App from '@/framework/core/facades/App';
import Service from '@/framework/core/Service';
import ServiceBootError from '@/framework/core/errors/ServiceBootError';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { ApplicationComponent, SnackbarStyle } from '@/framework/core/services/UIService';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

interface State {
    startupErrors: ErrorReport[];
}

interface ComputedState {
    hasStartupErrors: boolean;
}

export type ErrorSource = string | Error | JSError | unknown;

export interface ErrorReport {
    title: string;
    description?: string;
    details?: string;
    error?: Error | JSError | unknown;
}

export default class ErrorsService extends Service<State, ComputedState> {

    private enabled: boolean = true;

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public async inspect(error: ErrorSource | ErrorReport[]): Promise<void> {
        const reports = Array.isArray(error) ? error : [await this.createErrorReport(error)];

        UI.openModal(UI.resolveComponent(ApplicationComponent.ErrorReportModal), { reports });
    }

    public async report(error: ErrorSource, message?: string): Promise<void> {
        if (App.isDevelopment) {
            // eslint-disable-next-line no-console
            console.error(error);
        }

        if (!this.enabled) {
            throw error;
        }

        if (!App.isMounted) {
            const startupError = await this.createStartupErrorReport(error);

            if (startupError) {
                this.setState({ startupErrors: this.startupErrors.concat(startupError) });
            }

            return;
        }

        const report = await this.createErrorReport(error);

        UI.showSnackbar(message ?? translate('errors.notice'), {
            style: SnackbarStyle.Error,
            actions: [
                {
                    text: translate('errors.viewDetails'),
                    handler: () => UI.openModal(
                        UI.resolveComponent(ApplicationComponent.ErrorReportModal),
                        { reports: [report] },
                    ),
                },
            ],
        });
    }

    protected getInitialState(): State {
        return {
            startupErrors: [],
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            hasStartupErrors: ({ startupErrors }) => startupErrors.length > 0,
        };
    }

    private async createErrorReport(error: ErrorSource): Promise<ErrorReport> {
        if (typeof error === 'string') {
            return { title: error };
        }

        if (error instanceof UnsuccessfulNetworkRequestError) {
            const body = await error.response.text();

            return this.createErrorReportFromError(error, {
                title: 'Unsuccessful Request',
                details: `Response body:\n${body}\n\nStack trace:\n${error.stack}`,
            });
        }

        if (error instanceof Error || error instanceof JSError) {
            return this.createErrorReportFromError(error);
        }

        return {
            title: translate('errors.unknown'),
            error,
        };
    }

    private async createStartupErrorReport(error: ErrorSource): Promise<ErrorReport | null> {
        if (error instanceof ServiceBootError) {
            // Ignore second-order boot errors in order to have a cleaner startup crash screen.
            return error.cause instanceof ServiceBootError
                ? null
                : this.createErrorReport(error.cause);
        }

        return this.createErrorReport(error);
    }

    private createErrorReportFromError(error: Error | JSError, defaults: Partial<ErrorReport> = {}): ErrorReport {
        return {
            title: error.name,
            description: error.message,
            details: error.stack,
            error,
            ...defaults,
        };
    }

}

export default interface Errors extends IService<State, ComputedState> {}
