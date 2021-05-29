import { stringToSlug, urlResolve } from '@noeldemartin/utils';

import Model from './Recipe.schema';

export default class Recipe extends Model {

    public static history = true;
    public static rdfContexts = { schema: 'https://schema.org/' };

    public get uuid(): string | null {
        return this.url
            ? (this.url.match(/([^/#]+)(#.*)?$/)?.[1] ?? null)
            : null;
    }

    protected newUrl(documentUrl?: string, resourceHash?: string): string {
        documentUrl = documentUrl ?? urlResolve(this.static('collection'), stringToSlug(this.name));
        resourceHash = resourceHash ?? this.static('defaultResourceHash');

        return `${documentUrl}#${resourceHash}`;
    }

}
