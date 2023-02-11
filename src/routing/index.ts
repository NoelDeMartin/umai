import AutoLinking from '@/framework/core/facades/AutoLinking';
import Router from '@/framework/core/facades/Router';
import { defineRoutes, routeMeta } from '@/framework/routing/router';
import { translate } from '@/framework/utils/translate';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import Viewer from '@/services/facades/Viewer';

import Home from './pages/home/Home.vue';
import RecipesCreate from './pages/recipes/RecipesCreate.vue';
import RecipesEdit from './pages/recipes/RecipesEdit.vue';
import RecipesShow from './pages/recipes/RecipesShow.vue';
import ViewerPage from './pages/viewer/Viewer.vue';

declare module '@/framework/routing/router' {

    export interface AppRouteMeta {
        header?: boolean;
        footer?: boolean;
        fullBleedHeader?: boolean;
        reconnect?: boolean;
        pageFooter?: boolean;
    }

}

function captureCookbookUrls(url: string): (() => unknown) | false {
    const recipe = Cookbook.autoLink(url);

    if (!recipe) {
        return false;
    }

    return async () => {
        // TODO fix recipe --> recipe animation instead of doing this
        await Router.push({ name: 'home' });
        await Router.push(recipe.route());
    };
}

function captureViewerUrls(url: string): (() => unknown) | false {
    const autoLinked = Viewer.autoLink(url);

    if (!autoLinked) {
        return false;
    }

    return async () => {
        // TODO fix recipe --> recipe animation instead of doing this
        await Router.push(autoLinked.collection.route());
        await Router.push(autoLinked.recipe.route('viewer'));
    };
}

export function registerRouterBindings(): void {
    Router.registerModelBinding('recipe', {
        find: slug => Cookbook.recipes?.find(recipe => recipe.slug === slug) || null,
        subscribe: (slug, listener) => Recipe.on('updated', recipe => recipe.slug === slug && listener(recipe)),
    });
}

export function registerAutoLinkingScopes(): void {
    AutoLinking.registerScope('default', url => {
        if (!url.startsWith(document.location.origin)) {
            return false;
        }

        return async () => {
            // TODO fix recipe --> recipe animation instead of doing this
            // TODO use framework default instead
            await Router.push({ name: 'home' });
            await Router.push({ path: url.slice(document.location.origin.length) });
        };
    });

    AutoLinking.registerScope('recipes', url => {
        if (Viewer.active) {
            return captureViewerUrls(url);
        }

        return captureCookbookUrls(url);
    });
}

export default defineRoutes([
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
        meta: {
            fullBleedHeader: true,
            pageFooter: true,
        },
    },
    {
        name: 'recipes.show',
        path: '/recipes/:recipe',
        component: RecipesShow,
        meta: routeMeta<{ recipe: Recipe }>({
            title: ({ recipe }) => recipe.name,
            fullBleedHeader: true,
        }),
    },
    {
        name: 'recipes.edit',
        path: '/recipes/:recipe/edit',
        component: RecipesEdit,
        meta: routeMeta<{ recipe: Recipe }>({
            title: ({ recipe }) => translate('recipes.edit_title', { name: recipe.name }),
            fullBleedHeader: true,
            pageFooter: true,
        }),
    },
    {
        name: 'recipes.history',
        path: '/recipes/:recipe/history',
        component: () => import('./pages/recipes/RecipesHistory.vue'),
        meta: routeMeta<{ recipe: Recipe }>({
            title: ({ recipe }) => `${recipe.name} history`,
            header: false,
            footer: false,
        }),
    },
    {
        name: 'viewer',
        path: '/viewer',
        component: ViewerPage,
        meta: {
            header: false,
            reconnect: false,
            requiresIndexedDB: false,
        },
    },
]);
