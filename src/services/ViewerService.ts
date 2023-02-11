import { arrayFilter, isInstanceOf, tap, urlRoute } from '@noeldemartin/utils';
import { NetworkRequestError } from '@noeldemartin/solid-utils';
import { SolidEngine } from 'soukai-solid';
import { toRaw } from 'vue';

import Auth from '@/framework/core/facades/Auth';
import Errors from '@/framework/core/facades/Errors';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions , IService } from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import RecipesContainer from '@/models/RecipesContainer';
import RecipesList from '@/models/RecipesList';
import RecipesListItem from '@/models/RecipesListItem';
import { urlWithoutProtocol } from '@/utils/urls';
import type RecipesCollection from '@/models/contracts/RecipesCollection';

interface State {
    recipe: Recipe | null;
    list: RecipesList | null;
    container: RecipesContainer | null;
    recipesContainers: WeakMap<Recipe, RecipesContainer>;
}

interface ComputedState {
    collection: RecipesCollection | null;
}

export default class ViewerService extends Service<State, ComputedState> {

    private engine: SolidEngine = new SolidEngine((...args: [RequestInfo, RequestInit]) => Auth.fetch(...args));
    private collectionsAutoLinks: WeakMap<RecipesCollection, Record<string, Recipe>> = new WeakMap();
    private recipesContainersRequested: Set<string> = new Set();

    public get active(): boolean {
        return Router.currentRouteIs('viewer');
    }

    public getRecipeContainer(recipe: Recipe): RecipesContainer | null {
        return this.recipesContainers.get(toRaw(recipe)) ?? null;
    }

    public async view(url?: string): Promise<void> {
        const list = this.recipe?.lists?.find(list => list.url === url);
        const recipe = this.collection?.recipes?.find(recipe => recipe?.url === url);
        const recipeContainer = this.recipe && this.getRecipeContainer(this.recipe);
        const container = recipeContainer?.url === url ? recipeContainer : null;

        if (list) {
            await this.loadRecipesList(list);

            this.setState({ list, recipe: null, container: null });

            return;
        }

        if (recipe) {
            recipe.setRelationModels('lists', arrayFilter([this.list]));

            this.setState({ recipe, list: null, container: null });

            return;
        }

        if (container) {
            this.setState({ container, recipe: null, list: null });

            return;
        }

        this.setState({
            recipe: null,
            list: null,
            container: null,
        });
    }

    public async search(url: string): Promise<boolean> {
        return await this.findRecipe(url)
            || await this.findRecipesList(url)
            || await this.findRecipesContainer(url);
    }

    public async preloadList(list: RecipesList): Promise<void> {
        if (this.collectionsAutoLinks.has(list)) {
            return;
        }

        await this.loadRecipesList(list);
    }

    public async preloadContainer(url: string): Promise<void> {
        if (this.recipesContainersRequested.has(url)) {
            return;
        }

        await this.loadRecipesContainer(url);
    }

    public autoLink(url: string): { recipe: Recipe; collection: RecipesCollection } | null {
        const collection = this.collection
            ?? this.recipe?.lists?.[0]
            ?? (this.recipe && this.getRecipeContainer(this.recipe));
        const recipe = collection && this.collectionsAutoLinks.get(collection)?.[urlWithoutProtocol(url)];

        if (!collection || !recipe) {
            return null;
        }

        return { recipe, collection };
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Cookbook.booted;
    }

    protected getInitialState(): State {
        return {
            recipe: null,
            list: null,
            container: null,
            recipesContainers: new WeakMap(),
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            collection: ({ list, container }) => list ?? container ?? null,
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
            if (!isInstanceOf(error, NetworkRequestError)) {
                Errors.report(error);
            }

            return false;
        }
    }

    private async findRecipesList(url: string): Promise<boolean> {
        try {
            const list = await RecipesList.withEngine(this.engine, async () => {
                const lists = await RecipesList.all({ $in: [urlRoute(url)] });

                return lists[0] ?? null;
            });

            if (!list) {
                return false;
            }

            await this.loadRecipesList(list);

            this.setState({ list });

            return true;
        } catch(error) {
            if (!isInstanceOf(error, NetworkRequestError)) {
                Errors.report(error);
            }

            return false;
        }
    }

    private async findRecipesContainer(url: string): Promise<boolean> {
        const container = await this.loadRecipesContainer(url);

        if (!container) {
            return false;
        }

        this.setState({ container });

        return true;
    }

    private async loadRecipesList(list: RecipesList): Promise<void> {
        await RecipesList.withEngine(this.engine, () => list.loadRelationIfUnloaded('items'));
        await RecipesListItem.withEngine(
            this.engine,
            () => Promise.all(list.items?.map(item => item.loadRelationIfUnloaded('recipe')) ?? []),
        );

        this.setAutoLinks(list);
    }

    private async loadRecipesContainer(url: string): Promise<RecipesContainer | null> {
        this.recipesContainersRequested.add(url);

        const container = await RecipesContainer.withEngine(this.engine, async () => {
            const container = await RecipesContainer.find(url);

            await container?.loadRelation('recipes');

            return container;
        });

        if (!container || !container.recipes || container.recipes.length === 0) {
            return null;
        }

        this.replaceCurrentRecipeInstance(container);
        this.setState({ recipesContainers: new WeakMap(container.recipes?.map(recipe => [recipe, container])) });
        this.setAutoLinks(container);

        return container;
    }

    private replaceCurrentRecipeInstance(container: RecipesContainer): void {
        if (!this.recipe || !container.recipes) {
            return;
        }

        const index = container.recipes.findIndex(containerRecipe => containerRecipe.url === this.recipe?.url);

        if (index === null || index === -1) {
            return;
        }

        container.recipes[index] = toRaw(this.recipe);
    }

    private setAutoLinks(collection: RecipesCollection): void {
        this.collectionsAutoLinks.set(collection, (collection.recipes ?? []).reduce(
            (recipes, recipe) => tap(recipes, recipes => {
                recipe.autoLinks.forEach(autoLink => recipes[urlWithoutProtocol(autoLink)] = recipe);
            }),
            {} as Record<string, Recipe>,
        ));
    }

}

export default interface ViewerService extends IService<State, ComputedState> {}
