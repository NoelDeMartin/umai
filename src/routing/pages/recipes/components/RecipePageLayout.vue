<template>
    <div class="flex flex-col min-h-full">
        <!-- TODO maybe height should depend on screen height as well, not only breakpoints -->
        <div class="flex relative justify-center items-end w-full h-52 md:h-80 recipe-details--header">
            <slot name="image" />
            <div
                class="absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay recipe-details--header-overlay"
                :style="`height: ${$ui.headerHeight}px`"
            />
            <div class="relative pb-4 w-full mx-edge max-w-content recipe-details--header-wrapper">
                <slot name="title" />
            </div>
        </div>
        <div class="flex flex-grow justify-center pt-4 bg-white recipe-details--body">
            <div class="flex-grow max-w-content mx-edge">
                <div class="flex flex-col md:flex-row">
                    <!-- TODO show metadata in mobile layout -->
                    <div class="prose">
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
                    <div class="flex-grow" />
                    <div class="w-full md:w-72">
                        <slot name="metadata" />
                        <slot name="actions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts"></script>
