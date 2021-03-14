import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';

import Recipe from '@/models/Recipe';

export class CookbookService extends Service {

    protected async boot(): Promise<void> {
        await super.boot();

        Events.on('logout', async () => {
            const recipes = await Recipe.all();

            await Promise.all(recipes.map(recipe => recipe.delete()));
        });
    }

}

export const Cookbook = new CookbookService;
