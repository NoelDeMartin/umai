import type { Closure, ClosureArgs } from '@noeldemartin/utils';

import I18n from '@/framework/core/facades/I18n';

export type TranslateClosure = Closure<ClosureArgs, ReturnType<typeof I18n['translate']>>;

export const translate: typeof I18n['translate'] =
    (...args: ClosureArgs) => (I18n.translate as TranslateClosure)(...args);
