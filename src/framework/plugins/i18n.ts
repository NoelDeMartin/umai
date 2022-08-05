import { createI18n } from 'vue-i18n';
import type { Plugin } from 'vue';

// TODO this should be refactored to be able to translate strings
// before mounting the app instead of hard-coding messages here.
const MESSAGES: Record<string, string> = {
    'auth.invalidWebId': '`{webId}` does not return a valid webId document.',
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
    const { default: messages } = await import('@/lang/en.yaml');

    return createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        globalInjection: true,
        messages: { en: messages },
    });
}
