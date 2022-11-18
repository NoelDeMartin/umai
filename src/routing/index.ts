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
        name: 'recipes.history',
        path: '/recipes/:recipe/history',
        component: () => import('./pages/recipes/RecipesHistory.vue'),
        meta: { header: false, footer: false },
    },
    {
        name: 'viewer',
        path: '/viewer',
        component: Viewer,
        meta: { header: false, reconnect: false, requiresIndexedDB: false },
    },
];

export function registerRouterBindings(): void {
    Router.registerModelBinding('recipe', {
        find: slug => Cookbook.recipes?.find(recipe => recipe.slug === slug) || null,
        subscribe: (slug, listener) => Recipe.on('updated', recipe => recipe.slug === slug && listener(recipe)),
    });
}

export default routes;
