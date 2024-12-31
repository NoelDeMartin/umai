import {
    PromisedValue,
    arr,
    arrayUnique,
    isObject,
    range,
    requireUrlParentDirectory,
    requireUrlParse,
    stringToSlug,
    tap,
    urlResolveDirectory,
    urlRoute,
    uuid,
} from '@noeldemartin/utils';
import { SolidContainer, SolidTypeRegistration } from 'soukai-solid';
import { SolidDocumentPermission, findInstanceRegistrations } from '@noeldemartin/solid-utils';
import type { FluentArray, Obj, Tuple } from '@noeldemartin/utils';
import type { IndexedDBEngine } from 'soukai';
import type { SolidModel } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Browser from '@/framework/core/facades/Browser';
import Cloud from '@/framework/core/facades/Cloud';
import Events from '@/framework/core/facades/Events';
import Files from '@/framework/core/facades/Files';
import Service from '@/framework/core/Service';
import { setRemoteCollection } from '@/framework/cloud/remote_helpers';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import CookbookExistsError from '@/services/errors/cookbook-exists-error';
import Recipe from '@/models/Recipe';
import RecipeInstructionsStep from '@/models/RecipeInstructionsStep';
import RecipesList from '@/models/RecipesList';
import RecipesListItem from '@/models/RecipesListItem';
import { urlWithoutProtocol } from '@/utils/urls';

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'recipe-created': void;
        'recipe-deleted': void;
    }

}

interface State {
    created: boolean;
    localCookbookUrl: string;
    remoteCookbookUrl: string | null;
    publicRecipesList: RecipesList | null;
    allRecipes: FluentArray<Recipe>;
    usingRdfAliases: boolean;
}

interface ComputedState {
    isLocal: boolean;
    isRemote: boolean;
    recipes: FluentArray<Recipe>;
    recipesAutoLinks: Record<string, Recipe>;
}

export default class CookbookService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['remoteCookbookUrl', 'usingRdfAliases'];

    public cookbook: PromisedValue<SolidContainer> = new PromisedValue;

    private tmpRecipes: Record<string, Recipe> = {};

    public async initializeRemote(name: string, storageUrl: string): Promise<void> {
        const engine = Auth.requireAuthenticator().engine;
        const cookbook = await SolidContainer.withEngine(engine, async () => {
            const url = urlResolveDirectory(storageUrl, stringToSlug(name));
            const cookbook = await SolidContainer.find(url);

            if (cookbook) {
                throw new CookbookExistsError(cookbook);
            }

            return new SolidContainer({ url, name });
        });

        await this.initializeRemoteUsing(cookbook);
    }

    public async initializeRemoteUsing(cookbook: SolidContainer): Promise<void> {
        const user = Auth.requireUser();
        const engine = Auth.requireAuthenticator().engine;

        await SolidContainer.withEngine(engine, async () => {
            const typeIndexUrl = user.privateTypeIndexUrl ?? await Auth.createPrivateTypeIndex();

            await cookbook.save();
            await cookbook.register(typeIndexUrl, Recipe);
        });

        await this.initializeRemoteCookbook(cookbook);
        await this.reloadRecipes();
    }

    public getTmpRecipe(id: string): Recipe | null {
        return this.tmpRecipes[id] ?? null;
    }

    public saveTmpRecipe(recipe: Recipe): string {
        return tap(uuid(), id => this.tmpRecipes[id] = recipe);
    }

    public async deleteRecipe(recipe: Recipe): Promise<void> {
        if (this.isRemote) {
            await recipe.softDelete();
            await Cloud.syncIfOnline(recipe);

            return;
        }

        if (recipe.imageUrl && await Files.has(recipe.imageUrl)) {
            await Files.delete(recipe.imageUrl);
        }

        await recipe.delete();
    }

    public async updatePublicRecipeListing(recipe: Recipe, publish: boolean): Promise<void> {
        const publicRecipesList = await this.loadPublicRecipesList();

        if (publish && !publicRecipesList.has(recipe)) {
            publicRecipesList.relatedItems.attach({ recipeUrl: recipe.url });

            recipe.listUrls = arrayUnique([...recipe.listUrls, publicRecipesList.url]);
        }

        if (!publish && publicRecipesList.has(recipe)) {
            const item = publicRecipesList.items?.find(item => item.recipeUrl === recipe.url);

            item && publicRecipesList.relatedItems.detach(item);

            recipe.listUrls = recipe.listUrls.filter(url => url !== publicRecipesList.url);
        }

        if (publicRecipesList.exists() || (publicRecipesList.items && publicRecipesList.items.length > 0)) {
            await RecipesList.withEngine(
                Auth.requireAuthenticator().engine,
                () => publicRecipesList.save(),
            );
        }

        if (publicRecipesList.exists() && publicRecipesList.wasRecentlyCreated() && !publicRecipesList.isRegistered) {
            await this.registerPublicRecipesList(publicRecipesList);
        }

        if (recipe.isDirty()) {
            await recipe.save();
            await Cloud.sync(recipe);
        }
    }

    public async removePublicRecipeListing(recipe: Recipe): Promise<void> {
        const publicRecipesList = this.publicRecipesList ??= await this.findPublicRecipesList();

        if (!publicRecipesList) {
            return;
        }

        const item = publicRecipesList.items?.find(item => item.recipeUrl === recipe.url);

        item && publicRecipesList.relatedItems.detach(item);

        await RecipesList.withEngine(
            Auth.requireAuthenticator().engine,
            () => publicRecipesList.save(),
        );
    }

    public mendRecipe(recipe: Recipe): void {
        this.mendRecipeInstructions(recipe);
        recipe.fixMalformedAttributes();
    }

    public foundRecipeUsingRdfAliases(): void {
        this.setState({ usingRdfAliases: true });
        this.replaceRdfAliases();
    }

    public autoLink(url: string): Recipe | null {
        return this.recipesAutoLinks[urlWithoutProtocol(url)] ?? null;
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.booted;
        await Browser.booted;

        this.cookbook.onResolve(() => this.setState({ created: true }));
        this.cookbook.onReset(() => this.setState({ created: false }));
        this.cookbook.onReject(() => this.setState({ created: false }));

        this.aliasRdfPrefixes();

        if (!Browser.supportsIndexedDB) {
            return;
        }

        await this.loadCookbook();
        await this.loadRecipes();
        await this.enqueueFileUploads();

        Events.on('login', async session => {
            // TODO this should be refactored, because technically the cookbook is already loaded (it's just the local
            // one, not the remote, that's why this works now). Instead we should migrate both the local cookbook and
            // the recipes to match the remote declarations.
            await this.loadCookbook();

            RecipesList.setEngine(session.authenticator.engine);
            SolidTypeRegistration.setEngine(session.authenticator.engine);
        });

        Events.on('logout', async () => {
            this.cookbook.reset();
            this.resetModelDefinitions();
            this.setState({
                remoteCookbookUrl: null,
                allRecipes: arr<Recipe>(),
                usingRdfAliases: false,
            });
        });

        Recipe.on('deleted', recipe => {
            this.setState({ allRecipes: this.allRecipes.without([recipe]) });

            Events.emit('recipe-deleted');
        });
        Recipe.on('created', recipe => {
            this.setState({ allRecipes: this.allRecipes.concat([recipe]) });

            Events.emit('recipe-created');
        });

        // TODO investigate a different way to work around reactivity issues
        Recipe.on('updated', () => this.setState({ allRecipes: this.allRecipes.slice(0) }));
    }

    protected getInitialState(): State {
        return {
            created: this.cookbook.isResolved(),
            localCookbookUrl: Recipe.collection,
            remoteCookbookUrl: null,
            publicRecipesList: null,
            allRecipes: arr<Recipe>([]),
            usingRdfAliases: false,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            isLocal: ({ remoteCookbookUrl }) => !remoteCookbookUrl,
            isRemote: ({ remoteCookbookUrl }) => !!remoteCookbookUrl,
            recipes: ({ allRecipes }) => allRecipes.filter(recipe => !recipe.isSoftDeleted()),
            recipesAutoLinks: (_, { recipes }) => recipes.toArray().reduce(
                (recipes, recipe) => tap(recipes, recipes => {
                    recipe.autoLinks.forEach(autoLink => recipes[urlWithoutProtocol(autoLink)] = recipe);
                }),
                {} as Record<string, Recipe>,
            ),
        };
    }

    private async initializeRemoteCookbook(cookbook: SolidContainer): Promise<void> {
        await this.migrateLocalRecipes(cookbook.url);

        setRemoteCollection(Recipe, cookbook.url);

        if (cookbook.url !== this.remoteCookbookUrl) {
            this.setState({ remoteCookbookUrl: cookbook.url });
        }

        this.cookbook.resolve(cookbook);
    }

    private getCookbookModels(): Array<typeof SolidModel> {
        return [
            Recipe,
            RecipeInstructionsStep,
            RecipesList,
            RecipesListItem,
        ];
    }

    private aliasRdfPrefixes(): void {
        if (this.usingRdfAliases) {
            this.replaceRdfAliases();

            return;
        }

        this.getCookbookModels().forEach(modelClass => modelClass.aliasRdfPrefixes({
            'https://schema.org/': 'http://schema.org/',
        }));
    }

    private replaceRdfAliases(): void {
        this.getCookbookModels().forEach(modelClass => {
            modelClass.resetRdfAliases();
            modelClass.replaceRdfPrefixes({ 'https://schema.org/': 'http://schema.org/' });
            modelClass.aliasRdfPrefixes({ 'http://schema.org/': 'https://schema.org/' });
        });
    }

    private async loadRecipes(): Promise<void> {
        const recipes = [];
        const cookbookUrl = Recipe.collection;
        const engine = Recipe.requireEngine<IndexedDBEngine>();
        const collections = await engine.getCollections();
        const recipeCollections = collections.filter(collection => collection.startsWith(cookbookUrl));

        for (const collection of recipeCollections) {
            const collectionRecipes = await Recipe.from(collection).all();

            recipes.push(...collectionRecipes);
        }

        Recipe.collection = cookbookUrl;

        this.allRecipes = arr(recipes);
    }

    private async loadCookbook(): Promise<void> {
        if (Auth.isLoggedIn()) {
            const engine = Auth.authenticator.engine;

            await SolidContainer.withEngine(engine, async () => tap(
                await this.findCookbook(),
                cookbook => cookbook && this.initializeRemoteCookbook(cookbook),
            ));

            return;
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;
        RecipesList.collection = this.remoteCookbookUrl ?? RecipesList.collection;

        this.cookbook.resolve(new SolidContainer({ url: Recipe.collection, name: 'cookbook' }));
    }

    private async loadPublicRecipesList(): Promise<RecipesList> {
        this.publicRecipesList = this.publicRecipesList
            ?? await this.findPublicRecipesList()
            ?? this.newPublicRecipesList();

        return this.publicRecipesList;
    }

    private async reloadRecipes(): Promise<void> {
        await this.loadRecipes();
    }

    private async findCookbook(refreshStaleProfile: boolean = true): Promise<SolidContainer | null> {
        const user = Auth.requireUser();

        try {
            return await this.findCookbookInTypeIndex(user.privateTypeIndexUrl)
                ?? await this.findCookbookInTypeIndex(user.publicTypeIndexUrl)
                ?? null;
        } catch (error) {
            // TODO check that error was NetworkRequestError
            if (!refreshStaleProfile)
                throw error;

            await Auth.refreshUserProfile();
            await Auth.createPrivateTypeIndex();

            return this.findCookbook(false);
        }
    }

    private async findCookbookInTypeIndex(typeIndexUrl?: string): Promise<SolidContainer | null> {
        if (!typeIndexUrl) {
            return null;
        }

        const containers = await SolidContainer.fromTypeIndex(typeIndexUrl, Recipe);

        return containers[0] ?? null;
    }

    private async findPublicRecipesList(): Promise<RecipesList | null> {
        if (!Auth.isLoggedIn()) {
            return null;
        }

        const user = Auth.requireUser();

        if (user.publicTypeIndexUrl) {
            const authenticator = Auth.requireAuthenticator();
            const engine = authenticator.engine;
            const urls = await findInstanceRegistrations(
                user.publicTypeIndexUrl,
                RecipesList.rdfsClasses,
                authenticator.requireAuthenticatedFetch(),
            );

            for (const url of urls) {
                const list = await RecipesList.withEngine(engine, () => RecipesList.find(url));

                if (!list?.isPublic) {
                    continue;
                }

                return list;
            }
        }

        return null;
    }

    private newPublicRecipesList(): RecipesList {
        const user = Auth.requireUser();
        const remoteCookbookUrl = this.remoteCookbookUrl
                ?? fail('Cannot create a recipes list without a remote cookbook');

        return new RecipesList({
            url: `${remoteCookbookUrl}public#it`,
            name: user.name ? `${user.name}'s Public Recipes` : 'Public Recipes',
            creatorWebId: user.webId,
        });
    }

    private async migrateLocalRecipes(remoteCollection: string): Promise<void> {
        type UrlObject = { '@id': string };

        const recipes = await Recipe.all();
        const engine = Recipe.requireEngine();
        const isLocalUrlObject = (obj: Obj): obj is UrlObject => {
            return '@id' in obj && (obj['@id'] as string).startsWith(Recipe.collection);
        };
        const migrateLocalUrl = (urlObject: UrlObject): Tuple<string, 2> => {
            const localUrl = urlObject['@id'];
            const remoteUrl = localUrl.replace(Recipe.collection, remoteCollection);

            urlObject['@id'] = remoteUrl;

            return [localUrl, remoteUrl];
        };
        const migrateLocalUrls = (document: Obj): Tuple<string, 2>[] => {
            const entries = Object.entries(document);
            if (isLocalUrlObject(document)) {
                migrateLocalUrl(document);

                if (entries.length === 1) {
                    return [];
                }
            }

            return entries.reduce((fileRenames, [field, value]) => {
                if (isObject(value)) {
                    fileRenames.push(
                        ...(
                            field === 'image' && isLocalUrlObject(value)
                                ? [migrateLocalUrl(value)]
                                : migrateLocalUrls(value)
                        ),
                    );
                }

                return fileRenames;
            }, [] as Tuple<string, 2>[]);
        };

        for (const recipe of recipes) {
            if (recipe.url.startsWith(remoteCollection)) {
                continue;
            }

            const recipeUrl = recipe.url;
            const newRecipeUrl = recipe.url.replace(Recipe.collection, remoteCollection);
            const documentUrl = urlRoute(recipeUrl);
            const newDocumentUrl = urlRoute(newRecipeUrl);
            const document = await engine.readOne(Recipe.collection, documentUrl);
            const fileRenames = migrateLocalUrls(document);

            await Promise.all(fileRenames.map(async ([url, newUrl]) => {
                await Files.rename(url, newUrl);

                Cloud.enqueueFileUpload(recipe, newUrl);
            }));
            await engine.create(remoteCollection, document, newDocumentUrl);
            await engine.delete(Recipe.collection, documentUrl);

            recipe.onMoved(newRecipeUrl);
            Cloud.onModelMoved(recipeUrl, newRecipeUrl);
        }
    }

    private async enqueueFileUploads(): Promise<void> {
        if (!this.remoteCookbookUrl) {
            return;
        }

        const urls = await Files.getUrls();

        for (const url of urls) {
            const recipe = this.recipes.find(recipe => recipe.imageUrls.includes(url));

            if (!url.startsWith(this.remoteCookbookUrl) || !recipe) {
                continue;
            }

            Cloud.enqueueFileUpload(recipe, url);
        }
    }

    private async registerPublicRecipesList(publicRecipesList: RecipesList): Promise<void> {
        const user = Auth.requireUser();
        const engine = Auth.requireAuthenticator().engine;
        const typeIndexUrl = user.publicTypeIndexUrl ?? await Auth.createPublicTypeIndex();

        await Promise.all(RecipesList.rdfsClasses.map(async rdfsClass => {
            const typeRegistration = new SolidTypeRegistration({
                forClass: rdfsClass,
                instance: publicRecipesList.url,
            });

            typeRegistration.mintUrl(typeIndexUrl, true, uuid());

            await SolidTypeRegistration.withEngine(
                engine,
                () => typeRegistration.save(requireUrlParentDirectory(typeIndexUrl)),
            );
        }));

        await RecipesList.withEngine(
            engine,
            () => publicRecipesList.updatePublicPermissions([SolidDocumentPermission.Read]),
        );

        publicRecipesList.isRegistered = true;
    }

    private mendRecipeInstructions(recipe: Recipe): void {
        if (!recipe.instructions) {
            recipe.setRelationModels('instructions', []);
        }

        if (recipe.instructions?.length === recipe.instructionStepUrls.length) {
            return;
        }

        const { protocol } = requireUrlParse(recipe.url);

        recipe.instructionStepUrls = range(recipe.instructionStepUrls.length).map(index => {
            const instructionStep = recipe.instructionStepUrls[index];

            if (instructionStep.startsWith(protocol)) {
                return instructionStep;
            }

            const newInstructionStep = recipe.relatedInstructions.attach({
                text: instructionStep,
                position: index + 1,
            });

            newInstructionStep.mintUrl(recipe.requireDocumentUrl(), true, uuid());

            return newInstructionStep.url;
        });
    }

    private resetModelDefinitions(): void {
        Recipe.collection = this.localCookbookUrl;

        this.getCookbookModels().forEach(modelClass => {
            modelClass.resetRdfAliases();
            modelClass.replaceRdfPrefixes({ 'http://schema.org/': 'https://schema.org/' });
            modelClass.aliasRdfPrefixes({ 'https://schema.org/': 'http://schema.org/' });
        });
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
