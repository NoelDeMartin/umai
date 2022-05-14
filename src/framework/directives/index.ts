import { tap } from '@noeldemartin/utils';
import type { Directive } from 'vue';

function loadDirectives(modules: Record<string, { default: Directive }>): Record<string, Directive> {
    return Object
        .entries(modules)
        .reduce(
            (directives, [fileName, { default: directive }]) => {
                const name = fileName.match(/\/([^/]+)\.ts/)?.[1];

                return tap(directives, () => {
                    if (!name)
                        return;

                    directives[name] = directive;
                });
            },
            {} as Record<string, Directive>,
        );
}

export default {
    ...loadDirectives(import.meta.globEager('@/directives/*.ts')),
    ...loadDirectives(import.meta.globEager('@/framework/directives/*.ts')),
};
