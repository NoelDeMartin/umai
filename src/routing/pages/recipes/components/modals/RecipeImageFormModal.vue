<template>
    <AppModal v-slot="{ close }" :title="$t('recipes.image_edit_title')">
        <BaseForm :form="form" class="flex flex-col" @submit="submit(close)">
            <div v-if="url">
                <RecipeImage :url="url" class="w-full aspect-[5/2] max-h-[60vh] min-w-modal-content" />
                <div class="flex items-center mt-2" :title="isUploadPending ? $t('recipes.image_edit_localUrl') : ''">
                    <i-zondicons-time
                        v-if="isUploadPending"
                        class="w-4 h-4 mr-2"
                        :aria-label="$t('recipes.image_edit_uploadPending')"
                    />
                    <pre
                        v-if="!isLocalUrl"
                        class="flex items-center text-gray-700 overflow-auto whitespace-pre-wrap min-h-clickable align-center"
                    >{{ url }}</pre>
                </div>
            </div>
            <template v-else>
                <div>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md w-96">
                        <div class="space-y-1 text-center">
                            <i-zondicons-photo class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
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
                                <p class="pl-1">
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
                <BaseInput
                    ref="input"
                    name="customUrl"
                    class="mt-2"
                    placeholder="https://..."
                />
            </template>
            <div class="flex flex-col mt-4 space-y-2 w-full md:flex-row md:space-x-2 md:space-y-0 md:self-end">
                <BaseButton
                    v-if="url"
                    clear
                    class="self-start"
                    @click="url = '', form.customUrl = ''"
                >
                    <i-zondicons-trash class="w-4 h-4 mr-2" aria-hidden="true" />
                    {{ $t('recipes.image_edit_remove') }}
                </BaseButton>
                <div class="flex-grow" />
                <BaseButton secondary @click="close()">
                    {{ $t('recipes.image_edit_discard') }}
                </BaseButton>
                <BaseButton type="submit">
                    {{ $t('recipes.image_edit_submit') }}
                </BaseButton>
            </div>
        </BaseForm>
    </AppModal>
</template>

<script setup lang="ts">
import ImageBlobReduce from 'image-blob-reduce';
import { uuid } from '@noeldemartin/utils';
import { watchEffect } from 'vue';

import Files from '@/framework/core/facades/Files';
import UI from '@/framework/core/facades/UI';
import { FormInputType, reactiveForm } from '@/framework/forms';
import type { ModalCloseCallback } from '@/framework/core/services/UIService';

import type { RecipeImageFormModalProps, RecipeImageFormModalResult } from './RecipeImageFormModal';

const { imageUrl }: RecipeImageFormModalProps = defineProps({
    imageUrl: {
        type: String,
        default: null,
    },
});
const form = reactiveForm({
    customUrl: {
        type: FormInputType.String,
        default: imageUrl ?? '',
    },
});

let url = $ref(imageUrl ?? '');
let isUploadPending = $ref(false);
const isLocalUrl = $computed(() => /^(tmp|solid):\/\//.test(url));

async function uploadImage(file: File) {
    const imageUrl = `tmp://${uuid()}.png`;
    const blob = await (new ImageBlobReduce).toBlob(file, { max: 1024 });

    await Files.store(imageUrl, 'image/png', blob);

    url = imageUrl;
    form.customUrl = imageUrl;
    UI.hideLoading();
}

function submit(close: ModalCloseCallback<RecipeImageFormModalResult>) {
    const customUrl = form.customUrl.trim();

    close(customUrl.length > 0 ? customUrl : null);
}

watchEffect(async () => (isUploadPending = await Files.has(url)));
</script>
