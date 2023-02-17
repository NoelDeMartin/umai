import { captureException, init } from '@sentry/browser';
import {
    JSError,
    getLocationQueryParameter,
    hasLocationQueryParameter,
    isObject,
    parseBoolean,
    tap,
} from '@noeldemartin/utils';
import { UnsuccessfulNetworkRequestError } from '@noeldemartin/solid-utils';

import App from '@/framework/core/facades/App';
import Service from '@/framework/core/Service';
import ServiceBootError from '@/framework/core/errors/ServiceBootError';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { ApplicationComponent, SnackbarStyle } from '@/framework/core/services/UIService';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

interface State {
    reporting: boolean;
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
    sentryId?: string | null;
    error?: Error | JSError | unknown;
}

export default class ErrorsService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['reporting'];

    public forceReporting: boolean = false;
    public sentryConfigured: boolean = false;
    private enabled: boolean = true;
    private sentryInitialized: boolean = false;

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
        if (App.isDevelopment || App.isTesting) {
            this.logError(error);
        }

        if (!this.enabled) {
            throw error;
        }

        let sentryId: string | null | undefined;

        if (this.reportErrors()) {
            sentryId = this.reportToSentry(error) ?? undefined;
        }

        if (!App.isMounted) {
            const startupError = await this.createStartupErrorReport(error, sentryId);

            if (startupError) {
                this.setState({ startupErrors: this.startupErrors.concat(startupError) });
            }

            return;
        }

        const report = await this.createErrorReport(error, sentryId);

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

    public reportToSentry(error: ErrorSource): string | null {
        this.initializeSentry();

        try {
            return tap(
                captureException(error),

                // eslint-disable-next-line no-console
                sentryId => console.error(`Error reported to Sentry: '${sentryId}'`, error),
            );
        } catch (reportingError) {
            // eslint-disable-next-line no-console
            console.error('Failed reporting an error to Sentry', error, reportingError);
        }

        return null;
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.sentryConfigured = !!App.env('SENTRY_DSN');

        if (hasLocationQueryParameter('errorReporting')) {
            this.forceReporting = parseBoolean(getLocationQueryParameter('errorReporting'));
        }
    }

    protected getInitialState(): State {
        return {
            reporting: false,
            startupErrors: [],
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            hasStartupErrors: ({ startupErrors }) => startupErrors.length > 0,
        };
    }

    private reportErrors(): boolean {
        return this.sentryConfigured && (this.reporting || this.forceReporting);
    }

    private logError(error: unknown): void {
        // eslint-disable-next-line no-console
        console.error(error);

        if (isObject(error) && error.cause) {
            this.logError(error.cause);
        }
    }

    private async createErrorReport(error: ErrorSource, sentryId?: string | null | undefined): Promise<ErrorReport> {
        if (typeof error === 'string') {
            return { sentryId, title: error };
        }

        if (error instanceof UnsuccessfulNetworkRequestError) {
            const body = await error.response.text();

            return this.createErrorReportFromError(error, {
                sentryId,
                title: 'Unsuccessful Request',
                details: `Response body:\n${body}\n\nStack trace:\n${error.stack}`,
            });
        }

        if (error instanceof Error || error instanceof JSError) {
            return this.createErrorReportFromError(error, { sentryId });
        }

        return {
            title: translate('errors.unknown'),
            sentryId,
            error,
        };
    }

    private async createStartupErrorReport(
        error: ErrorSource,
        sentryId?: string | null | undefined,
    ): Promise<ErrorReport | null> {
        if (error instanceof ServiceBootError) {
            // Ignore second-order boot errors in order to have a cleaner startup crash screen.
            return error.cause instanceof ServiceBootError
                ? null
                : this.createErrorReport(error.cause, sentryId);
        }

        return this.createErrorReport(error, sentryId);
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

    private initializeSentry(): void {
        if (this.sentryInitialized) {
            return;
        }

        try {
            init({ dsn: App.env('SENTRY_DSN') });

            this.sentryInitialized = true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed initializing Sentry', error);
        }
    }

}

export default interface Errors extends IService<State, ComputedState> {}
