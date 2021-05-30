import { SolidContainerModel, SolidEngine, bootSolidModels } from 'soukai-solid';
import fetch from 'node-fetch';

const tasks: Cypress.Tasks = {
    async resetSolidPOD() {
        bootSolidModels();

        await SolidContainerModel.withEngine(new SolidEngine(fetch), async () => {
            const cookbook = await SolidContainerModel.find('http://localhost:4000/cookbook/');

            await Promise.all(cookbook?.resourceUrls.map(url => fetch(url, { method: 'DELETE' })) ?? []);
        });

        return null;
    },
};

export default tasks;
