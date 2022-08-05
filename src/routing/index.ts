import type { RouteRecordRaw } from 'vue-router';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';

import Home from './pages/home/Home.vue';
import RecipesCreate from './pages/recipes/RecipesCreate.vue';
import RecipesEdit from './pages/recipes/RecipesEdit.vue';
import RecipesShow from './pages/recipes/RecipesShow.vue';
import Viewer from './pages/viewer/Viewer.vue';

const routes: RouteRecordRaw[] = [
    {
        name: 'home',
        path: '/',
        component: Home,
    },
    {
        name: 'recipes.index',
        path: '/recipes',
        redirect: { name: 'home' },
    },
    {
        name: 'recipes.create',
        path: '/recipes/create',
        component: RecipesCreate,
        meta: { fullBleedHeader: true, pageFooter: true },
    },
    {
        name: 'recipes.show',
        path: '/recipes/:recipe',
        component: RecipesShow,
        meta: { fullBleedHeader: true },
    },
    {
        name: 'recipes.edit',
        path: '/recipes/:recipe/edit',
        component: RecipesEdit,
        meta: { fullBleedHeader: true, pageFooter: true },
    },
    {
        name: 'viewer',
        path: '/viewer',
        component: Viewer,
        meta: { header: false, reconnect: false },
    },
];

export function registerRouterBindings(): void {
    Router.registerModelBinding('recipe', {
        find: uuid => Cookbook.recipes?.find(recipe => recipe.uuid === uuid) || null,
        subscribe: (uuid, listener) => Recipe.on('updated', recipe => recipe.uuid === uuid && listener(recipe)),
    });
}

export default routes;
