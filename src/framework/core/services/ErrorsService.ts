import Service from '@/framework/core/Service';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { ApplicationComponent } from '@/framework/core/services/UIService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorReason = string | Error | any;

export interface ErrorReport {
    title: string;
    error?: Error;
}

export default class ErrorsService extends Service {

    private enabled: boolean = true;

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }

    public inspect(error: ErrorReason): void {
        const report = this.getErrorReport(error);

        UI.openModal(UI.resolveComponent(ApplicationComponent.ErrorReportModal), { report });
    }

    public report(error: ErrorReason): void {
        if (!this.enabled) throw error;

        const report = this.getErrorReport(error);

        const snackbarId = UI.showSnackbar(translate('errors.notice'), [
            {
                text: translate('errors.viewDetails'),
                handler: () => {
                    UI.hideSnackbar(snackbarId);
                    UI.openModal(UI.resolveComponent(ApplicationComponent.ErrorReportModal), { report });
                },
            },
        ]);
    }

    private getErrorReport(reason: ErrorReason): ErrorReport {
        return typeof reason === 'string'
            ? { title: reason }
            : {
                title: reason.message ?? translate('errors.unknown'),
                error: reason,
            };
    }

}
