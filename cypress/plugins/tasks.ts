import { SolidContainerModel, SolidEngine, bootSolidModels } from 'soukai-solid';
import fetch from 'node-fetch';

const tasks: Cypress.Tasks = {
    async resetSolidPOD() {
        bootSolidModels();

        await SolidContainerModel.withEngine(new SolidEngine(fetch), async () => {
            const cookbook = await SolidContainerModel.find('http://localhost:4000/cookbook/');

            await cookbook?.delete();
        });

        await fetch('http://localhost:4000/settings/privateTypeIndex', {
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body: `
                <> a
                    <http://www.w3.org/ns/solid/terms#TypeIndex>,
                    <http://www.w3.org/ns/solid/terms#UnlistedDocument> .
            `,
        });

        return null;
    },
};

export default tasks;
