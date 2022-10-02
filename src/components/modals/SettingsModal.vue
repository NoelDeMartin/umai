<template>
    <AppModal :title="$t('settings.title')" no-padding>
        <hr class="mt-3">
        <CoreToggle
            :label="$t('settings.animations')"
            :description="$t('settings.animations_description')"
            :model-value="$ui.animations"
            @update:modelValue="$event ? $ui.enableAnimations() : $ui.disableAnimations()"
        />
    </AppModal>
</template>

<script setup lang="ts"></script>
