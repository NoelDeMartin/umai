import App from '@/framework/core/facades/App';
import { FormInputType, reactiveForm } from '@/framework/forms';
import type { MagicForm } from '@/framework/forms';

import Config from '@/services/facades/Config';
import type IAppModal from '@/components/modals/AppModal';

export default interface IWebImportModal extends IAppModal<void> {
    websiteUrl?: string;
    scan(operation: Promise<unknown>): Promise<void>;
    parseWebsite(url: string, html: string): Promise<void>;
    retry(operation: () => unknown): Promise<void>;
    failed(url: string, error: Error): void;
}

export type WebImportModalUrlForm = MagicForm<{
    url: { type: FormInputType.String };
    useProxy: { type: FormInputType.Boolean };
    proxyUrl: { type: FormInputType.String };
}>;

export function useUrlForm(modal: IWebImportModal): {
    form: WebImportModalUrlForm;
    submit: () => Promise<void>;
} {
    const form = reactiveForm({
        url: {
            type: FormInputType.String,
            rules: 'required',
            default: modal.websiteUrl,
        },
        useProxy: {
            type: FormInputType.Boolean,
            default: Config.useProxy,
        },
        proxyUrl: {
            type: FormInputType.String,
            default: Config.proxyUrl || App.env('DEFAULT_PROXY_URL'),
        },
    });

    async function submit() {
        try {
            const url = form.url;
            const proxyUrl = form.useProxy ? form.proxyUrl : false;

            Config.updateProxy(form.useProxy, form.proxyUrl);

            const response = proxyUrl
                ? await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                })
                : await fetch(url);

            const text = await response.text();

            if (Math.floor(response.status / 100) !== 2)
                throw new Error(`Got unexpected response code: ${response.status}\n\n${text}`);

            await modal.parseWebsite(url, text);
        } catch (error) {
            modal.failed(form.url, error as Error);
        }
    }

    return { form, submit: () => modal.scan(submit()) };
}
