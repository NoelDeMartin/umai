import { closeEngineConnections } from 'soukai';
import { Storage, arr } from '@noeldemartin/utils';

import Events from '@/framework/core/facades/Events';
import { services } from '@/framework/core';
import type { Services } from '@/framework/core';

import boot from '@/boot';
import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';

const authenticatedRequests = arr<{ url: string; options: RequestInit }>();

window.testing = {
    start(options = {}) {
        return new Promise<boolean>(resolve => {
            window.onbeforeunload = () => resolve(true);

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

            boot({ beforeMount: app => options.beforeMount?.(app) })
                .then(() => {
                    window.onbeforeunload = null;

                    resolve(false);
                });
        });
    },

    async stop() {
        await closeEngineConnections();
    },

    queueAuthenticatedRequest(url, options) {
        authenticatedRequests.push({ url, options });
    },

    createRecipe: async (attributes, instructions) => {
        const recipe = new Recipe(attributes);

        instructions?.forEach((text, index) => recipe.relatedInstructions.attach({ position: index + 1, text }));

        await recipe.save();

        return recipe;
    },
    getRecipe: slug => Cookbook.allRecipes.first(recipe => recipe.slug === slug),
    getService: name => (services as Services)[name],
};
