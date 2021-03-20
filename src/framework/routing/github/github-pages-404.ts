import type { LocationQueryRaw, RouteLocationRaw } from 'vue-router';

function getQueryParams(url: URL): LocationQueryRaw {
    const queryParams: LocationQueryRaw = {};

    url.searchParams.forEach((value, key) => queryParams[key] = value);

    return queryParams;
}

function redirectHome(): void {
    const url = new URL(location.href);
    const route: RouteLocationRaw = {
        path: url.pathname,
        hash: url.hash,
        query: getQueryParams(url),
    };

    localStorage.setItem('github-pages-redirect', JSON.stringify(route));
    location.href = '/';
}

redirectHome();
