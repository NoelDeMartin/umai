import { meta, story, template } from '@sb/support/helpers';
import { RecipeFixture, recipeFixtures } from '@sb/fixtures/recipes';

import RecipeCard from '@/components/RecipeCard.vue';

interface Args {
    recipe: RecipeFixture;
}

const Template = template<Args>(({ recipe }) => {
    return {
        components: { RecipeCard },
        setup: () => ({ recipe: recipeFixtures[recipe] }),
        template: '<div class="w-80"><RecipeCard :recipe="recipe" /></div>',
    };
});

export const Showcase = story(template<Args>(({ recipe }) => ({
    components: { RecipeCard },
    setup: () => ({ recipe: recipeFixtures[recipe] }),
    template: `
        <div>
            <h2 class="mb-2 font-semibold text-center">Default</h2>
            <div class="w-80"><RecipeCard :recipe="recipe" /></div>
        </div>

        <div>
            <h2 class="mb-2 font-semibold text-center">Hover</h2>
            <div class="w-80"><RecipeCard :recipe="recipe" class=":hover" /></div>
        </div>

        <div>
            <h2 class="mb-2 font-semibold text-center">Keyboard focus</h2>
            <div class="w-80"><RecipeCard :recipe="recipe" class=":focus-visible" /></div>
        </div>
    `,
})));

export const Playground = story(Template);

export default meta<Args>({
    component: RecipeCard,
    title: 'RecipeCard',
    argTypes: {
        recipe: {
            control: { type: 'select' },
            options: RecipeFixture,
        },
    },
    args: {
        recipe: RecipeFixture.Ramen,
    },
});
