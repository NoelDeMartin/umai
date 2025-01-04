<template>
    <KitchenPage :title="$t('kitchen.index.title')" :show-kitchen-shortcut="false">
        <ul class="grid grid-cols-1 gap-3 my-3 mt-6 sm:grid-cols-2 md:grid-cols-3">
            <RecipeCard
                v-for="dish of $kitchen.dishes"
                :key="dish.recipe.url"
                :recipe="dish.recipe"
                :route="dish.getStageRoute()"
                :transitions="false"
            />
        </ul>
    </KitchenPage>
</template>
