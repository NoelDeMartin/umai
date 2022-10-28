import type { PromisedValue } from '@noeldemartin/utils';

import type { CloudHandler } from '@/framework/core/services/CloudService';

import Cookbook from '@/services/facades/Cookbook';
import type Recipe from '@/models/Recipe';

export default class RecipesCloudHandler implements CloudHandler<Recipe> {

    public booted: PromisedValue<void>;
    public active: boolean;

    constructor() {
        this.booted = Cookbook.booted;
        this.active = Cookbook.cookbook.isResolved();
    }

    public async initialize(): Promise<void> {
        Cookbook.cookbook.onResolve(() => this.active = true);
        Cookbook.cookbook.onReject(() => this.active = false);
    }

    public getLocalModels(): Recipe[] {
        return Cookbook.allRecipes.toArray();
    }

    public mendRemoteModel(recipe: Recipe): void {
        Cookbook.mendRecipe(recipe);
    }

    public getLocalModelsWithRemoteFileUrls(): { model: Recipe; remoteFileUrls: string[] }[] {
        return Cookbook.allRecipes.toArray().map(recipe => ({
            model: recipe,
            remoteFileUrls:
                Cookbook.remoteCookbookUrl &&
                recipe.imageUrl?.startsWith(Cookbook.remoteCookbookUrl)
                    ? [recipe.imageUrl]
                    : [],
        }));
    }

    public foundModelUsingRdfAliases(): void {
        Cookbook.foundRecipeUsingRdfAliases();
    }

}
