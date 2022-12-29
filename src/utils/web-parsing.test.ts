// Workaround for https://github.com/facebook/jest/issues/12183
jest.mock('@/framework/core/services/AppService.ts', () => class AppService {});
jest.mock('@/framework/core/services/LangService.ts', () => class LangService {});
jest.mock('@/framework/core/services/UIService.ts', () => class UIService {});

import { bootSolidModels } from 'soukai-solid';
import { InMemoryEngine, bootModels, setEngine } from 'soukai';

import Recipe from '@/models/Recipe';

import { parseWebsiteRecipes } from './web-parsing';
import { loadFixture } from '@/framework/testing/utils';
import { stringMatch } from '@noeldemartin/utils';

describe('Web Parsing', () => {

    beforeEach(() => {
        bootSolidModels();
        bootModels({ Recipe });
        setEngine(new InMemoryEngine);
    });

    it('parses recipes', async () => {
        // Arrange
        const url = 'https://recipes.example.com/ramen';
        const html = `
            <html>
                <head>
                    <script type="application/ld+json">
                        {"@context":"https://schema.org","@type":"Recipe","name":"Ramen"}
                    </script>
                </head>
                <body>
                    ...
                </body>
            </html>
        `;

        // Act
        const recipes = await parseWebsiteRecipes(url, html);

        // Assert
        expect(recipes).toHaveLength(1);
        expect(recipes[0]?.name).toEqual('Ramen');
    });

    it('parses recipes from graphs', async () => {
        // Arrange
        const { url, html } = loadHtmlFixture('recipes/keto-bolognese.html');

        // Act
        const recipes = await parseWebsiteRecipes(url, html);

        // Assert
        expect(recipes).toHaveLength(1);
        expect(recipes[0]?.name).toEqual('Keto Vegetarian Bolognese');
    });

});

function loadHtmlFixture(name: string): { url: string; html: string } {
    const html = loadFixture(name);
    const url = stringMatch<2>(html, /<!--(.*)-->/)?.[1].trim() ?? '';

    return { url, html };
}
