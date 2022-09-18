<template>
    <AppModal ref="$root" :title="$t('recipes.image_edit_title')">
        <CoreForm :form="form" class="flex flex-col" @submit="submit()">
            <div v-if="url">
                <RecipeImage :recipe="recipe" :url="url" class="w-full aspect-[5/2] max-h-[60vh] min-w-modal-content md:min-w-modal-content-md" />
                <div v-if="!isLocalUrl" class="flex items-center mt-2" :title="isUploadPending ? $t('recipes.image_edit_uploadPending') : ''">
                    <i-pepicons-clock
                        v-if="isUploadPending"
                        class="w-4 h-4 mr-2"
                        :aria-label="$t('recipes.image_edit_uploadPending')"
                    />
                    <pre class="flex items-center text-gray-700 overflow-auto whitespace-pre-wrap min-h-clickable align-center">{{
                        url
                    }}</pre>
                </div>
            </div>
            <template v-else>
                <div>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md md:w-96">
                        <div class="space-y-1 text-center">
                            <i-mdi-image class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                            <div class="flex text-sm text-gray-600">
                                <BaseFileInput
                                    class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                    accept="image/png, image/jpeg, image/gif"
                                    @start="$ui.showLoading($t('recipes.image_edit_uploading'))"
                                    @error="(error: unknown) => ($errors.report(error), $ui.hideLoading())"
                                    @success="(file: File) => uploadImage(file)"
                                >
                                    <span>{{ $t('recipes.image_edit_upload') }}</span>
                                </BaseFileInput>
                                <p class="pl-1 hidden md:block">
                                    {{ $t('recipes.image_edit_drop') }}
                                </p>
                            </div>
                            <p class="text-xs text-gray-500">
                                {{ $t('recipes.image_edit_mimeTypes') }}
                            </p>
                        </div>
                    </div>
                </div>
                <span class="text-gray-800 mt-4">{{ $t('recipes.image_edit_customUrl') }}:</span>
                <CoreInput
                    ref="input"
                    :label="$t('recipes.image_edit_url')"
                    name="customUrl"
                    class="mt-2"
                    placeholder="https://..."
                />
            </template>
            <div class="flex flex-col mt-4 space-y-2 w-full self-end md:flex-row md:space-x-2 md:space-y-0">
                <CoreButton
                    v-if="url"
                    clear
                    class="self-start"
                    @click="url = '', form.customUrl = ''"
                >
                    <i-pepicons-trash class="w-5 h-5 mr-2" aria-hidden="true" />
                    {{ $t('recipes.image_edit_remove') }}
                </CoreButton>
                <div class="flex-grow" />
                <CoreButton
                    class="self-end"
                    secondary
                    @click="$root?.close(null)"
                >
                    {{ $t('recipes.image_edit_discard') }}
                </CoreButton>
                <CoreButton
                    v-initial-focus
                    class="self-end"
                    type="submit"
                >
                    {{ $t('recipes.image_edit_submit') }}
                </CoreButton>
            </div>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import ImageBlobReduce from 'image-blob-reduce';
import { uuid } from '@noeldemartin/utils';
import { watchEffect } from 'vue';

import Errors from '@/framework/core/facades/Errors';
import Files from '@/framework/core/facades/Files';
import UI from '@/framework/core/facades/UI';
import { FormInputType, reactiveForm } from '@/framework/forms';
import { objectProp, stringProp } from '@/framework/utils/vue';

import type IAppModal from '@/components/modals/AppModal';
import type Recipe from '@/models/Recipe';

import type { RecipeImageFormModalProps, RecipeImageFormModalResult } from './RecipeImageFormModal';

const { imageUrl }: RecipeImageFormModalProps = defineProps({
    recipe: objectProp<Recipe>(),
    imageUrl: stringProp(),
});
const form = reactiveForm({
    customUrl: {
        type: FormInputType.String,
        default: imageUrl ?? '',
    },
});

let url = $ref(imageUrl ?? '');
let isUploadPending = $ref(false);
const $root = $ref<IAppModal<RecipeImageFormModalResult> | null>(null);
const isLocalUrl = $computed(() => /^(tmp|solid):\/\//.test(url));

async function uploadImage(file: File) {
    try {
        const imageUrl = `tmp://${uuid()}.png`;
        const blob = await (new ImageBlobReduce).toBlob(file, { max: 1024 });

        await Files.store(imageUrl, 'image/png', blob);

        url = imageUrl;
        form.customUrl = imageUrl;
    } catch (error) {
        Errors.report(error);
    } finally {
        UI.hideLoading();
    }
}

function submit() {
    const customUrl = form.customUrl.trim();

    $root?.close(customUrl.length > 0 ? customUrl : null);
}

watchEffect(async () => (isUploadPending = await Files.has(url)));
</script>
