<template>
    <div>
        <ol class="mb-4">
            <li v-for="(instruction, index) of instructionSteps" :key="instruction.id">
                <RecipeInstructionStepInput
                    :ref="el => el && (inputs[index] = el as unknown as IRecipeInstructionStepInput)"
                    v-model="instruction.description"
                    :name="`instruction-step-${instruction.id}`"
                    :position="index + 1"
                    class="block"
                    @add="addInstructionStep(index)"
                    @remove="removeInstructionStep(index)"
                />
            </li>
        </ol>
        <BaseButton @click="addInstructionStep(instructionSteps.length - 1)">
            {{ $t('recipes.instructionStep_add') }}
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type IRecipeInstructionStepInput from './RecipeInstructionStepInput';
import type { RecipeInstructionStepInputData } from './RecipeInstructionStepInput';

const emit = defineEmits(['update:modelValue']);
const { modelValue } = defineProps({
    modelValue: {
        type: Array as PropType<RecipeInstructionStepInputData[]>,
        default: [] as RecipeInstructionStepInputData[],
    },
});
const instructionSteps = $computed(() => modelValue);
const inputs = $ref<IRecipeInstructionStepInput[]>([]);

async function addInstructionStep(index: number) {
    const newInstructionStep: RecipeInstructionStepInputData = { id: uuid(), description: '' };

    emit('update:modelValue', arrayWithItemAt(instructionSteps, newInstructionStep, index));

    await nextTick();

    inputs[index + 1].focus();
}

async function removeInstructionStep(index: number) {
    inputs[index === 0 ? 1 : index - 1]?.focus();

    await inputs[index].playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(instructionSteps, index));
}
</script>
