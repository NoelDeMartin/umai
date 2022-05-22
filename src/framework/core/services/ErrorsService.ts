import I18n from '@/framework/core/facades/I18n';
import Service from '@/framework/core/Service';
import UI from '@/framework/core/facades/UI';

import ErrorReportModal from '@/components/modals/ErrorReportModal.vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorReason = string | Error | any;

export interface ErrorReport {
    title: string;
    error?: Error;
}

export default class ErrorsService extends Service {

    public inspect(error: ErrorReason): void {
        const report = this.getErrorReport(error);

        UI.openModal(ErrorReportModal, { report });
    }

    public report(error: ErrorReason): void {
        const report = this.getErrorReport(error);

        const snackbarId = UI.showSnackbar(I18n.translate('errors.notice'), [
            {
                text: I18n.translate('errors.viewDetails'),
                handler: () => {
                    UI.hideSnackbar(snackbarId);
                    UI.openModal(ErrorReportModal, { report });
                },
            },
        ]);
    }

    private getErrorReport(reason: ErrorReason): ErrorReport {
        return typeof reason === 'string'
            ? { title: reason }
            : {
                title: reason.message ?? I18n.translate('errors.unknown'),
                error: reason,
            };
    }

}
