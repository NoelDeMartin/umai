import type { NavigationGuard } from 'vue-router';

import Auth from '@/framework/core/facades/Auth';

const authGuard: NavigationGuard = async (_, __, next) => {
    await Auth.ready;

    Auth.loggedIn
        ? next()
        : next({ name: 'login' });
};

export default authGuard;
