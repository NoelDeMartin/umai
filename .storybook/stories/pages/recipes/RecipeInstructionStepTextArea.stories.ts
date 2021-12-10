import { meta, story, template } from '@sb/support/helpers';

import RecipeInstructionStepInput from '@/routing/pages/recipes/components/RecipeInstructionStepInput.vue';

interface Args {
    value: string;
}

const Template = template<Args>(({ value }) => {
    return {
        components: { RecipeInstructionStepInput },
        data: () => ({ value }),
        template: '<RecipeInstructionStepInput v-model="value" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: RecipeInstructionStepInput,
    title: 'RecipeInstructionStepInput',
    args: {
        value:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
            'In volutpat mauris sapien, a pretium velit ornare ac. ' +
            'Donec eleifend nulla non mattis tempus. Pellentesque habitant morbi ' +
            'tristique senectus et netus et malesuada fames ac turpis egestas. ' +
            'Quisque vitae elit orci. Cras congue nulla leo, porta sagittis dolor mollis sit amet. ' +
            'Morbi non turpis id erat porta accumsan a bibendum nisl. Curabitur sit amet nisi diam.',
    },
});
