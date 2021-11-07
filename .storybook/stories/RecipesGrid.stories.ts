import { meta, story, template } from '@sb/support/helpers';
import { recipeFixtures } from '@sb/fixtures/recipes';

import RecipesGrid from '@/components/RecipesGrid.vue';

interface Args {
    //
}

const Template = template<Args>(() => {
    return {
        components: { RecipesGrid },
        setup: () => ({ recipes: Object.values(recipeFixtures) }),
        template: '<div class="w-full bg-red-50"><RecipesGrid :recipes="recipes" /></div>',
    };
});

export const Base = story(Template);

export default meta<Args>({
    component: RecipesGrid,
    title: 'RecipesGrid',
});
