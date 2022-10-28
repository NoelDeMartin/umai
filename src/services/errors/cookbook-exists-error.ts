import { JSError } from '@noeldemartin/utils';
import type { SolidContainerModel } from 'soukai-solid';

export default class CookbookExistsError extends JSError {

    public readonly cookbook: SolidContainerModel;

    constructor(cookbook: SolidContainerModel) {
        super(`Cookbook with url '${cookbook.url}' already exists`);

        this.cookbook = cookbook;
    }

}
