import type { NavigationGuard } from 'vue-router';

import Auth from '@/framework/core/facades/Auth';

const guestGuard: NavigationGuard = async (_, __, next) => {
    await Auth.ready;

    Auth.loggedIn
        ? next({ name: 'home' })
        : next();
};

export default guestGuard;
