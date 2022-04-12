import { getLocationQueryParameters } from '@noeldemartin/utils';
import type { RouteLocationRaw } from 'vue-router';

function redirectHome(): void {
    const url = new URL(location.href);
    const route: RouteLocationRaw = {
        path: url.pathname,
        hash: url.hash,
        query: getLocationQueryParameters(),
    };

    localStorage.setItem('github-pages-redirect', JSON.stringify(route));
    location.href = '/';
}

redirectHome();
