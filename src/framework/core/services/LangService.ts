import { Storage, arrayUnique, stringCapitalize, stringMatch, tap } from '@noeldemartin/utils';
import { watch } from 'vue';
import type { LocaleMessages, VueMessageType } from 'vue-i18n';

import Events from '@/framework/core/facades/Events';
import I18n from '@/framework/core/facades/I18n';
import Service from '@/framework/core/Service';

import localesDisplayNames from '@/lang/locales.json';

const DEFAULT_LOCALE_STORAGE_KEY = 'lang.locale';

export default class LangService extends Service {

    public readonly locales: string[];
    public readonly displayNames: Record<string, string>;
    public readonly defaultLocale: string;
    public readonly fallbackLocale: string = 'en';

    private localeLoaders: Record<string, () => Promise<unknown>>;
    private loadedLocales: Set<string> = new Set();

    constructor() {
        super();

        this.localeLoaders = this.initLocaleLoaders();
        this.locales = Object.keys(this.localeLoaders);
        this.displayNames = this.locales.reduce((displayNames, locale) => {
            displayNames[locale] ??= stringCapitalize(
                (new Intl.DisplayNames([locale], { type: 'language' })).of(locale) ?? locale,
            );

            return displayNames;
        }, localesDisplayNames as Record<string, string>);
        this.defaultLocale = this.initDefaultLocale();
    }

    public async loadLocaleMessages(locale: string): Promise<LocaleMessages<VueMessageType, string, string>> {
        const { default: messages } = await this.localeLoaders[locale]?.() as {
            default: LocaleMessages<VueMessageType, string, string>;
        };

        return messages;
    }

    public async getDefaultLocalesMessages(): Promise<Record<string, LocaleMessages<VueMessageType, string, string>>> {
        const locales = await Promise.all(
            arrayUnique([this.defaultLocale, this.fallbackLocale]).map(async locale => {
                const messages = await this.loadLocaleMessages(locale);

                return { locale, messages };
            }),
        );

        locales.map(({ locale }) => this.loadedLocales.add(locale));

        return locales.reduce((defaultLocalesMessages, { locale, messages }) => {
            defaultLocalesMessages[locale] = messages;

            return defaultLocalesMessages;
        }, {} as Record<string, LocaleMessages<VueMessageType, string, string>>);
    }

    public async change(locale: string): Promise<void> {
        if (!this.loadedLocales.has(locale)) {
            const messages = await this.loadLocaleMessages(locale);

            I18n.setLocaleMessages(locale, messages);
        }

        I18n.locale.value = locale;

        document.querySelector('html')?.setAttribute('lang', locale);
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Events.on('application-mounted', () => {
            watch(I18n.locale, () => Storage.set(DEFAULT_LOCALE_STORAGE_KEY, I18n.locale.value));
        });
    }

    private initLocaleLoaders(): Record<string, () => Promise<unknown>> {
        const fileLoaders = import.meta.glob('@/lang/*.yaml');

        return Object.entries(fileLoaders).reduce((loaders, [fileName, loader]) => {
            const locale = stringMatch<2>(fileName, /.*\/lang\/(.+)\.yaml/)?.[1];

            if (locale) {
                loaders[locale] = loader;
            }

            return loaders;
        }, {} as Record<string, () => Promise<unknown>>);
    }

    private initDefaultLocale(): string {
        if (Storage.has(DEFAULT_LOCALE_STORAGE_KEY)) {
            return Storage.require<string>(DEFAULT_LOCALE_STORAGE_KEY);
        }

        return tap(navigator.languages.find(locale => this.locales.includes(locale)) ?? 'en', defaultLocale => {
            Storage.set(DEFAULT_LOCALE_STORAGE_KEY, defaultLocale);
        });
    }

}
