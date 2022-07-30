import { tap } from '@noeldemartin/utils';

export type FormValidationRule = (value: unknown) => string | null;

export function defineValidationRule(rule: FormValidationRule): FormValidationRule {
    return rule;
}

export default Object
    .entries(import.meta.glob('@/framework/forms/rules/*.ts', { eager: true }))
    .reduce(
        (rules, [fileName, module]) => {
            const name = fileName.match(/([^/]+)\.ts/)?.[1];

            return tap(rules, () => {
                if (!name)
                    return;

                rules[name] = (module as { default: FormValidationRule}).default;
            });
        },
        {} as Record<string, FormValidationRule>,
    );
