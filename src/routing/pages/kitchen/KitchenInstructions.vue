<template>
    <KitchenPage :recipe="recipe" :title="title">
        <div class="flex-grow">
            <CoreMarkdown
                v-if="text"
                :text="text"
                class="text-gray-700 mt-2"
                auto-link="recipes"
            />
            <CoreMarkdown
                v-else
                :text="$t('kitchen.instructions.empty')"
                class="text-gray-700 mt-2"
                auto-link="recipes"
            />

            <template v-if="timers.length > 0">
                <h3 class="mt-4 font-medium text-lg">
                    {{ $t('kitchen.timers.title') }}
                </h3>

                <ul class="mt-2">
                    <li v-for="(timer, index) of timers" :key="index" class="bg-gray-100 rounded-lg px-3 py-4 max-w-lg">
                        <KitchenTimer :timer="timer" />
                    </li>
                </ul>
            </template>
        </div>

        <div class="flex w-full justify-end space-x-2 mt-3">
            <CoreButton v-if="position === 1" route="kitchen.ingredients" :route-params="{ recipe: recipe.slug }">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton v-else route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: position - 1 }">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton v-if="!text || position === recipe.instructions?.length" route="kitchen.completed" :route-params="{ recipe: recipe.slug }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
            </CoreButton>
            <CoreButton v-else route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: position + 1 }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
            </CoreButton>
        </div>
    </KitchenPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { requiredObjectProp, requiredStringProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import Kitchen from '@/services/facades/Kitchen';
import type Recipe from '@/models/Recipe';

const props = defineProps({
    recipe: requiredObjectProp<Recipe>(),
    step: requiredStringProp(),
});

const position = computed(() => parseInt(props.step));
const dish = computed(() => Kitchen.findDish(props.recipe));
const text = computed(() => {
    return props.recipe.instructions?.find(instructionStep => instructionStep.position === position.value)?.text;
});
const title = computed(() => {
    if (props.recipe.instructions?.length === 1 || !text.value) {
        return translate('kitchen.instructions.emptyTitle');
    }

    return translate('kitchen.instructions.title', { step: props.step });
});
const timers = computed(() => Kitchen.timers.filter(timer => dish.value && timer.hasDish(dish.value, position.value)));

onMounted(() => dish.value?.updateStage(position.value));
</script>
