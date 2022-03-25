import { tap } from '@noeldemartin/utils';
import type { Directive } from 'vue';

export default Object
    .entries(import.meta.globEager('@/framework/directives/*.ts'))
    .reduce(
        (directives, [fileName, { default: directive }]) => {
            const name = fileName.match(/\.\/(.+)\.ts/)?.[1];

            return tap(directives, () => {
                if (!name)
                    return;

                directives[name] = directive;
            });
        },
        {} as Record<string, Directive>,
    );
