import { tap } from '@noeldemartin/utils';

export type FormValidationRule = (value: unknown) => string | null;

export function defineValidationRule(rule: FormValidationRule): FormValidationRule {
    return rule;
}

export default Object
    .entries(import.meta.globEager('@/framework/forms/rules/*.ts'))
    .reduce(
        (rules, [fileName, { default: rule }]) => {
            const name = fileName.match(/\.\/(.+)\.ts/)?.[1];

            return tap(rules, () => {
                if (!name)
                    return;

                rules[name] = rule;
            });
        },
        {} as Record<string, FormValidationRule>,
    );
