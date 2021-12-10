import { meta, story, template } from '@sb/support/helpers';

import RecipeIngredientInput from '@/routing/pages/recipes/components/RecipeIngredientInput.vue';

interface Args {
    value: string;
}

const Template = template<Args>(({ value }) => {
    return {
        components: { RecipeIngredientInput },
        data: () => ({ value }),
        template: '<RecipeIngredientInput v-model="value" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: RecipeIngredientInput,
    title: 'RecipeIngredientInput',
    args: {
        value: '300g Cheese',
    },
});
