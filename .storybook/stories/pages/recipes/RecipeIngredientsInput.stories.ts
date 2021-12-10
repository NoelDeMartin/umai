import { uuid } from '@noeldemartin/utils';

import { meta, story, template } from '@sb/support/helpers';

import RecipeIngredientsInput from '@/routing/pages/recipes/components/RecipeIngredientsInput.vue';
import type { RecipeIngredientInputData } from '@/routing/pages/recipes/components/RecipeIngredientInput';

interface Args {
    value: string[];
}

const Template = template<Args>(({ value }) => {
    const ingredients: RecipeIngredientInputData[] = value.map(name => ({ id: uuid(), name }));

    return {
        components: { RecipeIngredientsInput },
        data: () => ({ ingredients }),
        template: '<RecipeIngredientsInput v-model="ingredients" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: RecipeIngredientsInput,
    title: 'RecipeIngredientsInput',
    args: {
        value: [
            '200g Chickpeas',
            '1tbsp Tahini',
            '2 Lemons',
            '1 Garlic Clove',
            'EVOO',
            'Parsley',
            'S&P',
        ],
    },
});
