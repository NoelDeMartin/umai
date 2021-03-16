import type { RouteRecordRaw } from 'vue-router';

import authGuard from './guards/auth';
import guestGuard from './guards/guest';

import Home from './pages/home/Home.vue';
import Login from './pages/login/Login.vue';
import NotFound from './pages/not-found/NotFound.vue';
import RecipesCreate from './pages/recipes/create/RecipesCreate.vue';
import RecipesShow from './pages/recipes/show/RecipesShow.vue';

export const routes: RouteRecordRaw[] = [
    { name: 'home', path: '/', component: Home, beforeEnter: [authGuard] },
    { name: 'login', path: '/login', component: Login, beforeEnter: [guestGuard] },
    { name: 'recipes.index', path: '/recipes', redirect: { name: 'home' } },
    { name: 'recipes.show', path: '/recipes/:uuid', component: RecipesShow, props: true, beforeEnter: [authGuard] },
    { name: 'recipes.create', path: '/recipes/create', component: RecipesCreate, beforeEnter: [authGuard] },
    { name: 'errors.404', path: '/:path(.*)*', component: NotFound },
];
