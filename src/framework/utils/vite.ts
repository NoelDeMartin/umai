import { escapeRegexText, tap } from '@noeldemartin/utils';

export function importModules<T>(modulesGlob: Record<string, { default: T }>, extension: string): Record<string, T> {
    const regex = new RegExp(`/([^/]+)${escapeRegexText(extension)}`);

    return Object.entries(modulesGlob).reduce((importedModules, [fileName, { default: module }]) => {
        const name = fileName.match(regex)?.[1];

        return tap(importedModules, () => {
            if (!name) return;

            importedModules[name] = module;
        });
    }, {} as Record<string, T>);
}
