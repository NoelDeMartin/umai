import type { RouteRecordRaw } from 'vue-router';

import authGuard from './guards/auth';
import guestGuard from './guards/guest';

import Home from './pages/home/Home.vue';
import Login from './pages/login/Login.vue';

export const routes: RouteRecordRaw[] = [
    { name: 'home', path: '/', component: Home, beforeEnter: [authGuard] },
    { name: 'login', path: '/login', component: Login, beforeEnter: [guestGuard] },
];
