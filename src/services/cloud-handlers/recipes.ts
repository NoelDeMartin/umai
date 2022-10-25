import type { PromisedValue } from '@noeldemartin/utils';

import type { CloudHandler } from '@/framework/core/services/CloudService';

import Cookbook from '@/services/facades/Cookbook';
import type Recipe from '@/models/Recipe';

export default class RecipesCloudHandler implements CloudHandler<Recipe> {

    public ready: PromisedValue<void>;
    public enabled: boolean;

    constructor() {
        this.ready = Cookbook.ready;
        this.enabled = Cookbook.cookbook.isResolved();
    }

    public async initialize(): Promise<void> {
        Cookbook.cookbook.onResolve(() => this.enabled = true);
        Cookbook.cookbook.onReject(() => this.enabled = false);
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
