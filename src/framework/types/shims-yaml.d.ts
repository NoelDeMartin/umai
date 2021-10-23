declare module '@/lang/*.yaml' {
    import type { LocaleMessages, VueMessageType } from 'vue-i18n';

    const _default: LocaleMessages<VueMessageType>;
    export default _default;
}
