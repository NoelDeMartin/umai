import { createI18n } from 'vue-i18n';
import type { Plugin } from 'vue';

export default async function(): Promise<Plugin> {
    const { default: messages } = await import('@/lang/en.yaml');

    return createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: { en: messages },
    });
}
