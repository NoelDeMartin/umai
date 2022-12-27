import type { ComposerTranslation, LocaleMessages, VueMessageType } from 'vue-i18n';
import type { Ref } from 'vue';

import { facade } from '@/framework/core/facades';

export default facade<{
    locale: Ref<string>;
    translate: ComposerTranslation;
    hasMessage(key: string, locale?: string | null): boolean;
    setLocaleMessages(locale: string, messages: LocaleMessages<VueMessageType, string, string>): void;
}>();
