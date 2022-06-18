import type { ComposerTranslation } from 'vue-i18n';

import { facade } from '@/framework/core/facades';

export default facade<{
    translate: ComposerTranslation;
    hasMessage(key: string): boolean;
}>();
