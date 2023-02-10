import { translate } from '@/framework/utils/translate';

import { defineValidationRule } from './';

export default defineValidationRule(value => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return null;
    }

    if (typeof value !== 'string' && value) {
        return null;
    }

    return translate('validation.required');
});
