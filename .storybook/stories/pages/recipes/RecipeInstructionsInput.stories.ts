import { uuid } from '@noeldemartin/utils';

import { meta, story, template } from '@sb/support/helpers';

import RecipeInstructionsInput from '@/routing/pages/recipes/components/RecipeInstructionsInput.vue';
import type { RecipeInstructionStepInputData } from '@/routing/pages/recipes/components/RecipeInstructionStepInput';

interface Args {
    value: string[];
}

const Template = template<Args>(({ value }) => {
    const instructionSteps: RecipeInstructionStepInputData[] = value.map(description => ({
        id: uuid(),
        description,
    }));

    return {
        components: { RecipeInstructionsInput },
        data: () => ({ instructionSteps }),
        template: `
            <div class="prose">
                <RecipeInstructionsInput v-model="instructionSteps" />
            </div>
        `,
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: RecipeInstructionsInput,
    title: 'WIP/RecipeInstructionsInput',
    args: {
        value: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
                'In volutpat mauris sapien, a pretium velit ornare ac. ' +
                'Donec eleifend nulla non mattis tempus. Pellentesque habitant morbi ' +
                'tristique senectus et netus et malesuada fames ac turpis egestas. ',
            'Quisque vitae elit orci. Cras congue nulla leo, porta sagittis dolor mollis sit amet. ' +
                'Morbi non turpis id erat porta accumsan a bibendum nisl. Curabitur sit amet nisi diam.',
        ],
    },
});
