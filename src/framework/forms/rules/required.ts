import { translate } from '@/framework/utils/translate';

import { defineValidationRule } from './';

export default defineValidationRule(value => {
    if (value)
        return null;

    return translate('validation.required');
});
