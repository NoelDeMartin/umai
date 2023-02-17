import { createI18n } from 'vue-i18n';
import type { Plugin } from 'vue';

import Lang from '@/framework/core/facades/Lang';

// TODO this should be refactored to be able to translate strings
// before mounting the app instead of hard-coding messages here.
const MESSAGES: Record<string, string> = {
    'auth.stuckConnecting': 'We didn\'t hear back from the identity provider, maybe try reconnecting?',
};

export function i18nTranslate(key: string, params: Record<string, string> = {}): string {
    const message = (MESSAGES[key] ?? key) as string;

    return Object.entries(params).reduce(
        (message, [name, value]) => message.replace(`{${name}}`, value),
        message,
    );
}

export default async function(): Promise<Plugin> {
    const messages = await Lang.getDefaultLocalesMessages();

    return createI18n({
        locale: Lang.defaultLocale,
        fallbackLocale: Lang.fallbackLocale,
        globalInjection: true,
        messages,
    });
}
