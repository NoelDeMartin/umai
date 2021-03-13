import Service from '@/framework/core/Service';
import Services from '@/framework/core/Services';

import Recipe from '@/models/Recipe';

export class Cookbook extends Service {

    protected async boot(): Promise<void> {
        await super.boot();

        Services.$events.on('logout', async () => {
            const recipes = await Recipe.all();

            await Promise.all(recipes.map(recipe => recipe.delete()));
        });
    }

}
