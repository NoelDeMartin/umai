import { arrayFilter, urlRoute } from '@noeldemartin/utils';
import { NetworkError, SolidEngine } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Errors from '@/framework/core/facades/Errors';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions , IService } from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import RecipesList from '@/models/RecipesList';
import RecipesListItem from '@/models/RecipesListItem';

interface State {
    recipe: Recipe | null;
    list: RecipesList | null;
}

interface ComputedState {
    recipeInCookbook: Recipe | null;
}

export default class ViewerService extends Service<State, ComputedState> {

    private engine: SolidEngine = new SolidEngine((...args: [RequestInfo, RequestInit]) => Auth.fetch(...args));

    public async view(url?: string): Promise<void> {
        const list = this.recipe?.lists?.find(list => list.url === url);
        const recipe = this.list?.items?.map(item => item.recipe).find(recipe => recipe?.url === url);

        if (list) {
            await RecipesList.withEngine(this.engine, () => list.loadRelationIfUnloaded('items'));
            await RecipesListItem.withEngine(
                this.engine,
                () => Promise.all(list.items?.map(item => item.loadRelationIfUnloaded('recipe')) ?? []),
            );

            this.setState({ list, recipe: null });

            return;
        }

        if (recipe) {
            recipe.setRelationModels('lists', arrayFilter([this.list]));

            this.setState({ recipe, list: null });

            return;
        }

        this.setState({
            recipe: null,
            list: null,
        });
    }

    public async search(url: string): Promise<boolean> {
        return await this.findRecipe(url)
            || await this.findRecipesList(url);
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Cookbook.ready;
    }

    protected getInitialState(): State {
        return {
            recipe: null,
            list: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            recipeInCookbook({ recipe }) {
                if (!recipe?.url) {
                    return null;
                }

                return Cookbook.recipes.find(
                    localRecipe => localRecipe.url === recipe.url || localRecipe.externalUrls.includes(recipe.url),
                ) ?? null;
            },
        };
    }

    private async findRecipe(url: string): Promise<boolean> {
        try {
            const recipe = await Recipe.withEngine(this.engine, async () => {
                const recipes = await Recipe.all({ $in: [urlRoute(url)] });

                await recipes[0]?.loadRelationIfUnloaded('lists');

                return recipes[0] ?? null;
            });

            if (!recipe) {
                return false;
            }

            this.setState({ recipe });

            return true;
        } catch(error) {
            if (!(error instanceof NetworkError))
                Errors.report(error);

            return false;
        }
    }

    private async findRecipesList(url: string): Promise<boolean> {
        try {
            const list = await RecipesList.withEngine(this.engine, async () => {
                const lists = await RecipesList.all({ $in: [urlRoute(url)] });

                await lists[0]?.loadRelationIfUnloaded('items');

                return lists[0] ?? null;
            });

            if (!list) {
                return false;
            }

            await RecipesListItem.withEngine(
                this.engine,
                () => Promise.all(list.items?.map(item => item.loadRelation('recipe')) ?? []),
            );

            this.setState({ list });

            return true;
        } catch(error) {
            if (!(error instanceof NetworkError))
                Errors.report(error);

            return false;
        }
    }

}

export default interface ViewerService extends IService<State, ComputedState> {}
