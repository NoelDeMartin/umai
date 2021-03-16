<template>
    <div class="flex items-center self-center justify-center flex-grow">
        <RecipeForm ref="form" @done="$router.push({ name: 'home' })" />
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref } from 'vue';

export default defineComponent({
    setup() {
        const form = ref<{ focus(): void }>();

        onMounted(async () => {
            await nextTick();

            form.value?.focus();
        });

        return { form };
    },
});
</script>
