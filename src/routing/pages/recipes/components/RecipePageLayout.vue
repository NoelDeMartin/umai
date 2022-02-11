<template>
    <div class="flex overflow-hidden flex-col min-h-full">
        <!-- TODO fix mobile layout -->
        <div class="flex relative justify-center items-end w-full h-52 md:h-80 recipe-details--header">
            <slot name="image" />
            <div
                class="absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay recipe-details--header-overlay"
                :style="`height: ${$ui.headerHeight}px`"
            />
            <div class="flex relative justify-center pb-4 w-full mx-edge recipe-details--header-wrapper">
                <div class="flex-grow pr-36 mr-8 max-w-readable recipe-details--header-title-wrapper">
                    <slot name="title" />
                </div>
                <div class="w-72" />
            </div>
        </div>
        <div class="flex flex-grow justify-center pt-4 bg-white recipe-details--body">
            <div class="flex-grow mx-edge">
                <div class="flex flex-col justify-center md:flex-row">
                    <div class="mr-8 prose">
                        <slot name="description" />
                        <template v-if="$slots.ingredients">
                            <h2>{{ $t('recipes.ingredients') }}</h2>
                            <slot name="ingredients" />
                        </template>
                        <template v-if="$slots.instructions">
                            <h2>{{ $t('recipes.instructions') }}</h2>
                            <slot name="instructions" />
                        </template>
                        <span aria-hidden="true" class="block h-0 opacity-0">
                            This text is here just to make this div grow... If you're reading this without using some
                            developer tool, this is a bug. Please report it :).
                        </span>
                    </div>
                    <div
                        class="flex-shrink-0 w-72"
                        :style="`transform:translateY(-${metadataHeight}px)`"
                    >
                        <div class="relative">
                            <svg
                                preserveAspectRatio="none"
                                class="absolute -top-4 right-1/2 text-white translate-x-1/2 pointer-events-none fill-current recipe-page-layout--metadata-decoration"
                                viewBox="0 0 260 30"
                                :style="`height:${metadataHeight}px;width:400%`"
                            >
                                <path d="M0 30.206s71.996 1.005 83-17c11.852-19.392 84.385-15.73 94 0 11.003 18 83 17 83 17z" />
                            </svg>
                            <div class="relative">
                                <slot name="metadata" />
                            </div>
                        </div>
                        <div class="mt-12">
                            <slot name="actions" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TailwindCSS from '@/framework/utils/tailwindcss';

const { metadataRows } = defineProps({
    metadataRows: {
        type: Number,
        default: 3,
    },
});
const metadataHeight = $computed(
    () =>
        metadataRows
            ? metadataRows * TailwindCSS.pixels('spacing.10') + 2 * TailwindCSS.pixels('spacing.4')
            : 0,
);
</script>
