<template>
    <div>
        <span class="sr-only">{{ $t('recipes.drag_instructions_a11y') }}</span>
        <SortableList class="pl-0" @swapItems="swapInstructionStep">
            <SortableListItem v-for="(instruction, index) of instructionSteps" :key="instruction.id">
                <template #marker>
                    <span class="text-lg font-semibold text-primary-600" aria-hidden="true">
                        {{ index + 1 }}.
                    </span>
                </template>
                <RecipeInstructionStepInput
                    :ref="el => el && (inputs[index] = el as unknown as IRecipeInstructionStepInput)"
                    v-model="instruction.description"
                    :name="`instruction-step-${instruction.id}`"
                    :position="index + 1"
                    class="flex-grow"
                    @add="addInstructionStep(index)"
                    @remove="removeInstructionStep(index)"
                    @swapUp="swapInstructionStep(index, index - 1, true)"
                    @swapDown="swapInstructionStep(index, index + 1, true)"
                />
            </SortableListItem>
        </SortableList>
        <BaseButton class="mt-4" @click="addInstructionStep(instructionSteps.length - 1)">
            {{ $t('recipes.instructionStep_add') }}
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { arraySwap, arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
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

async function swapInstructionStep(firstIndex: number, secondIndex: number, focus?: boolean) {
    if (Math.max(firstIndex, secondIndex) > instructionSteps.length - 1 || Math.min(firstIndex, secondIndex) < 0)
        return;

    arraySwap(instructionSteps, firstIndex, secondIndex);

    if (!focus)
        return;

    await nextTick();

    inputs[secondIndex]?.focus();
}

async function addInstructionStep(index: number) {
    const newInstructionStep: RecipeInstructionStepInputData = { id: uuid(), description: '' };

    emit('update:modelValue', arrayWithItemAt(instructionSteps, newInstructionStep, index));

    await nextTick();

    inputs[index + 1]?.focus();
}

async function removeInstructionStep(index: number) {
    inputs[index === 0 ? 1 : index - 1]?.focus();

    await inputs[index]?.playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(instructionSteps, index));
}
</script>
