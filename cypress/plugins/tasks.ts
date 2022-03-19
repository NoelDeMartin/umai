import fetch from 'node-fetch';
import { SolidContainerModel, SolidEngine, bootSolidModels } from 'soukai-solid';
import { existsSync, rmdir } from 'fs';

async function removeDir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => rmdir(
        path,
        { maxRetries: 10, recursive: true },
        err => err ? reject(err) : resolve(),
    ));
}

function defineTasks(tasks: Cypress.Tasks): Cypress.Tasks {
    return Object.entries(tasks).reduce((tasks, [name, task]) => {
        tasks[name] = (...args) => {
            const result = task(...args);

            return result instanceof Promise
                ? result.then(asyncResult => asyncResult ?? null)
                : result ?? null;
        };

        return tasks;
    }, {} as Cypress.Tasks);
}

export default defineTasks({

    async deleteFolder(folderName) {
        if (!existsSync(folderName))
            return;

        await removeDir(folderName);
    },

    async resetSolidPOD() {
        bootSolidModels();

        await SolidContainerModel.withEngine(new SolidEngine(fetch), async () => {
            const cookbook = await SolidContainerModel.find('http://localhost:4000/cookbook/');

            if (!cookbook)
                return;

            await Promise.all(
                cookbook
                    .resourceUrls
                    .filter(url => /\.(jpe?|pn)g$/.test(url))
                    .map(url => fetch(url, { method: 'DELETE' })),
            );
            await cookbook.delete();
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
    },

});
