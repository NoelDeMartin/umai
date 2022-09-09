import type { JSError } from '@noeldemartin/utils';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorReason = string | Error | JSError | any;

export interface ErrorReport {
    title: string;
    error?: Error;
}

export default class ErrorsService extends Service<State, ComputedState> {

    private enabled: boolean = true;

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public inspect(error: ErrorReason | ErrorReport[]): void {
        const reports = Array.isArray(error) ? error : [this.getErrorReport(error)];

        UI.openModal(UI.resolveComponent(ApplicationComponent.ErrorReportModal), { reports });
    }

    public report(error: ErrorReason, message?: string): void {
        if (App.isDevelopment) {
            // eslint-disable-next-line no-console
            console.error(error);
        }

        if (!this.enabled) {
            throw error;
        }

        if (!App.isMounted) {
            const startupError = this.getStartupErrorReport(error);

            if (startupError) {
                this.setState({ startupErrors: this.startupErrors.concat(startupError) });
            }

            return;
        }

        UI.showSnackbar(message ?? translate('errors.notice'), {
            style: SnackbarStyle.Error,
            actions: [
                {
                    text: translate('errors.viewDetails'),
                    handler: () => UI.openModal(
                        UI.resolveComponent(ApplicationComponent.ErrorReportModal),
                        { reports: [this.getErrorReport(error)] },
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

    private getErrorReport(reason: ErrorReason): ErrorReport {
        return typeof reason === 'string'
            ? { title: reason }
            : {
                title: reason.message ?? translate('errors.unknown'),
                error: reason,
            };
    }

    private getStartupErrorReport(error: ErrorReason): ErrorReason | null {
        if (error instanceof ServiceBootError) {
            // Ignore second-order boot errors in order to have a cleaner startup crash screen.
            return error.cause instanceof ServiceBootError
                ? null
                : this.getErrorReport(error.cause);
        }

        return error;
    }

}

export default interface Errors extends IService<State, ComputedState> {}
