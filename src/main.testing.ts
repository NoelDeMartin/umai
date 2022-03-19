import { closeEngineConnections } from 'soukai';
import { Storage, arr } from '@noeldemartin/utils';

import boot from '@/boot';
import Events from '@/framework/core/facades/Events';
import Recipe from '@/models/Recipe';

const authenticatedRequests = arr<{ url: string; options: RequestInit }>();

window.testing = {
    async start(options = {}) {
        if (options.resetProfiles && Storage.has('auth')) {
            const auth = Storage.require<Record<string, unknown>>('auth');

            Storage.set('auth', {
                ...auth,
                profiles: {},
            });
        }

        Events.on('authenticated-fetch-ready', async fetch => {
            for (const request of authenticatedRequests) {
                await fetch(request.url, request.options);
            }

            authenticatedRequests.clear();
        });

        await boot();
    },

    async stop() {
        await closeEngineConnections();
    },

    queueAuthenticatedRequest(url, options) {
        authenticatedRequests.push({ url, options });
    },

    createRecipe: attributes => Recipe.create(attributes),
};
