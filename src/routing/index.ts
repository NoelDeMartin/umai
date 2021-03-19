import type { RouteRecordRaw } from 'vue-router';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';

import authGuard from './guards/auth';
import guestGuard from './guards/guest';

import Home from './pages/home/Home.vue';
import Login from './pages/login/Login.vue';
import RecipesCreate from './pages/recipes/RecipesCreate.vue';
import RecipesEdit from './pages/recipes/RecipesEdit.vue';
import RecipesShow from './pages/recipes/RecipesShow.vue';

export function registerRouterBindings(): void {
    Router.registerModelBinding('recipe', uuid => Cookbook.recipes?.find(recipe => recipe.uuid === uuid));
}

export const routes: RouteRecordRaw[] = [
    { name: 'home', path: '/', component: Home, beforeEnter: [authGuard] },
    { name: 'login', path: '/login', component: Login, beforeEnter: [guestGuard] },
    { name: 'recipes.index', path: '/recipes', redirect: { name: 'home' } },
    { name: 'recipes.create', path: '/recipes/create', component: RecipesCreate, beforeEnter: [authGuard] },
    { name: 'recipes.show', path: '/recipes/:recipe', component: RecipesShow, beforeEnter: [authGuard] },
    { name: 'recipes.edit', path: '/recipes/:recipe/edit', component: RecipesEdit, beforeEnter: [authGuard] },
];
