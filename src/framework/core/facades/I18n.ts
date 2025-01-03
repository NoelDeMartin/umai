import { facade, fail } from '@noeldemartin/utils';
import type { ComposerTranslation, LocaleMessages, VueMessageType } from 'vue-i18n';
import type { Ref } from 'vue';

export type I18n = {
    locale: Ref<string>;
    translate: ComposerTranslation;
    hasMessage(key: string, locale?: string | null): boolean;
    setLocaleMessages(locale: string, messages: LocaleMessages<VueMessageType, string, string>): void;
};

export default facade(() => fail<I18n>('I18n facade cannot be initialized lazily'));
