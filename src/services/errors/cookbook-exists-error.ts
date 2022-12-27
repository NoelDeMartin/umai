import { JSError } from '@noeldemartin/utils';
import type { SolidContainer } from 'soukai-solid';

export default class CookbookExistsError extends JSError {

    public readonly cookbook: SolidContainer;

    constructor(cookbook: SolidContainer) {
        super(`Cookbook with url '${cookbook.url}' already exists`);

        this.cookbook = cookbook;
    }

}
