<template>
    <AppModal v-slot="{ close }" :title="$t('recipes.image_edit_title')">
        <div class="flex flex-col">
            <div class="relative">
                <RecipeImage :url="url" class="w-96 aspect-[5/2]" style="max-height:60vh" />
                <button
                    v-if="url"
                    type="button"
                    class="absolute top-2 right-2 p-2 text-white bg-black rounded-full opacity-50 focus:opacity-100 hover:opacity-100"
                    :aria-label="$t('recipes.image_edit_clear')"
                    @click="url = '', input?.focus()"
                >
                    <i-zondicons-close class="w-4 h-4" />
                </button>
            </div>
            <BaseFluidInput
                ref="input"
                v-model="url"
                name="image_url"
                class="mt-2"
                :placeholder="$t('recipes.image_edit_placeholder')"
            />
            <div class="flex flex-col mt-4 space-y-2 w-full md:flex-row md:space-x-2 md:space-y-0 md:w-auto md:self-end">
                <BaseButton secondary class="w-full" @click="close()">
                    {{ $t('recipes.image_edit_discard') }}
                </BaseButton>
                <BaseButton @click="submit(close)">
                    {{ $t('recipes.image_edit_submit') }}
                </BaseButton>
            </div>
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { nextTicks } from '@/framework/utils/vue';
import type { ModalCloseCallback } from '@/framework/core/services/UIService';

import type IBaseFluidInput from '@/components/base/BaseFluidInput';

import type { RecipeImageFormModalProps, RecipeImageFormModalResult } from './RecipeImageFormModal';

const props: RecipeImageFormModalProps = defineProps({
    imageUrl: {
        type: String,
        default: null,
    },
});
const input = ref<IBaseFluidInput>();
const url = ref(props.imageUrl ?? '');

onMounted(async () => {
    await nextTicks(2);

    input.value?.focus();
});

function submit(close: ModalCloseCallback<RecipeImageFormModalResult>) {
    const cleanUrl = url.value.trim();

    close(cleanUrl.length > 0 ? cleanUrl : null);
}
</script>
