import type { Directive } from 'vue';

export default Object
    .entries(import.meta.globEager('./**'))
    .reduce(
        (directives, [fileName, { default: directive }]) => {
            const name = fileName.match(/\.\/(.+)\.ts/)?.[1];

            if (name) {
                directives[name] = directive;
            }

            return directives;
        },
        {} as Record<string, Directive>,
    );
