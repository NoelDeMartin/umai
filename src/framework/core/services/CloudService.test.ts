import Recipe from '@/models/Recipe';
import { bootSolidModels } from 'soukai-solid';
import { createStore } from 'vuex';
import { InMemoryEngine, bootModels, setEngine } from 'soukai';
import { mock } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Store from '@/framework/core/facades/Store';
import type Authenticator from '@/framework/auth/Authenticator';
import type AuthService from '@/framework/core/services/AuthService';

import CloudService from './CloudService';

describe('Cloud Service', () => {

    let cloud: CloudService;
    let localEngine: InMemoryEngine;
    let remoteEngine: InMemoryEngine;

    beforeEach(async () => {
        const localModels: Recipe[] = [];

        cloud = new CloudService;
        localEngine = new InMemoryEngine;
        remoteEngine = new InMemoryEngine;

        setEngine(localEngine);
        bootSolidModels();
        bootModels({ Recipe });

        Store.setInstance(createStore({}));
        Auth.setInstance(mock<AuthService>({
            isLoggedIn: () => true,
            authenticator: mock<Authenticator>({ newEngine: () => remoteEngine }),
        }));

        cloud.registerHandler(Recipe, {
            getLocalModels: () => localModels,
            isReady: () => true,
        });

        await cloud.launch();
    });

    it('pulls remote models', async () => {
        // Arrange
        const remoteRamen = await Recipe.withEngine(remoteEngine, async () => {
            const ramen = await Recipe.create({ name: 'Small Ramen' });

            await ramen.update({ name: 'Medium Ramen' });

            return ramen;
        });

        // Act
        await cloud.sync();

        // Assert
        const localRamen = await Recipe.find(remoteRamen.url) as Recipe;

        expect(localRamen).not.toBeNull();
        expect(localRamen.getAttributes()).toEqual(remoteRamen.getAttributes());
        expect(localRamen.getHistoryHash()).toEqual(remoteRamen.getHistoryHash());
    });

    it('creates remote models with local modifications', async () => {
        // Arrange
        let remoteRamen = await Recipe.withEngine(remoteEngine, async () => {
            const ramen = await Recipe.create({ name: 'Small Ramen' });

            await ramen.update({ name: 'Medium Ramen' });

            return ramen;
        });

        await cloud.sync();

        const localRamen = await Recipe.find(remoteRamen.url) as Recipe;

        // Act
        await localRamen.update({ name: 'Large Ramen' });

        // Assert
        remoteRamen = cloud.dirtyRemoteModels.get(localRamen.url) as Recipe;

        expect(remoteRamen).not.toBeNull();
        expect(remoteRamen.exists()).toBe(true);
        expect(remoteRamen.operations[0].exists()).toBe(true);
        expect(remoteRamen.operations[1].exists()).toBe(true);
        expect(remoteRamen.operations[2].exists()).toBe(false);

        expect(cloud.remoteOperationUrls).toEqual({
            [remoteRamen.url]: [
                remoteRamen.operations[0].url,
                remoteRamen.operations[1].url,
            ],
        });
    });

});
