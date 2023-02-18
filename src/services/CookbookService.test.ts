// Workaround for https://github.com/facebook/jest/issues/12183
jest.mock('@/framework/core/services/AppService.ts', () => class AppService {});
jest.mock('@/framework/core/services/LangService.ts', () => class LangService {});
jest.mock('@/framework/core/services/UIService.ts', () => class UIService {});

import { bootSolidModels } from 'soukai-solid';
import { createStore } from 'vuex';
import { fakeContainerUrl, fakeDocumentUrl, fakeResourceUrl, mockFetch } from '@noeldemartin/solid-utils';
import { InMemoryEngine, bootModels, setEngine } from 'soukai';
import { mock } from '@noeldemartin/utils';
import type { EngineDocument } from 'soukai';
import type { FetchMock } from '@noeldemartin/solid-utils';

import AuthMock from '@/framework/core/facades/Auth.mock';
import Browser from '@/framework/core/facades/Browser';
import CloudMock from '@/framework/core/facades/Cloud.mock';
import Store from '@/framework/core/facades/Store';

import CookbookService from '@/services/CookbookService';
import Recipe from '@/models/Recipe';
import RecipesList from '@/models/RecipesList';

describe('Cookbook Service', () => {

    let fetch: FetchMock;
    let engine: InMemoryEngine;
    let cookbook: CookbookService;

    beforeEach(async () => {
        fetch = mockFetch();
        engine = new InMemoryEngine();
        cookbook = new CookbookService();

        setEngine(engine);
        bootSolidModels();
        bootModels({ Recipe, RecipesList });

        AuthMock.use(fetch);
        CloudMock.use();
        Store.setInstance(createStore({}));
        Browser.setInstance(mock());

        await cookbook.launch();
    });

    it('Updates public listing for existing empty public list', async () => {
        // Arrange
        const recipesContainerUrl = fakeContainerUrl();
        const recipe = new Recipe({
            url: fakeResourceUrl({ containerUrl: recipesContainerUrl }),
            name: 'Ramen',
        }, true);
        const listDocumentUrl = fakeDocumentUrl();
        const listUrl = fakeResourceUrl({ documentUrl: listDocumentUrl });
        const publicTypeIndexUrl = fakeResourceUrl();

        AuthMock.mockUser({ publicTypeIndexUrl });
        Recipe.collection = recipesContainerUrl;

        engine.database[recipesContainerUrl] = {
            [recipe.requireDocumentUrl()]: { '@graph': [recipe.toJsonLD()] } as EngineDocument,
        };

        fetch.mockResponse(`
            <> a <http://www.w3.org/ns/solid/terms#TypeIndex> .

            <#public-list>
                a <http://www.w3.org/ns/solid/terms#TypeRegistration>;
                <http://www.w3.org/ns/solid/terms#forClass> <https://schema.org/ItemList>;
                <http://www.w3.org/ns/solid/terms#instance> <${listUrl}>.
        `);
        fetch.mockResponse(
            `
                <#it>
                    a <https://schema.org/ItemList>;
                    <https://schema.org/name> "Public Recipes" .
            `,
            { 'WAC-Allow': 'public="read"' },
        );
        fetch.mockResponse();
        fetch.mockResponse();

        // Act
        await cookbook.updatePublicRecipeListing(recipe, true);

        // Assert
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(fetch).toHaveBeenNthCalledWith(3, listDocumentUrl, { headers: { Accept: 'text/turtle' } });
        expect(fetch.mock.calls[3]?.[1]?.body).toEqualSparql(`
            INSERT DATA {
                <#it> <https://schema.org/itemListElement> <#[[list-item][%uuid%]]> .

                <#[[list-item][%uuid%]]>
                    a <https://schema.org/ListItem> ;
                    <https://schema.org/item> <${recipe.url}> .
            }
        `);

        const freshRecipe = await recipe.fresh();
        expect(freshRecipe.listUrls).toEqual([listUrl]);
    });

});
