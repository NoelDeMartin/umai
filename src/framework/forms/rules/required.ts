import I18n from '@/framework/core/facades/I18n';

import { defineValidationRule } from './';

export default defineValidationRule(value => {
    if (value) return null;

    return I18n.translate('validation.required');
});
