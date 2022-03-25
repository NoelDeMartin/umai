import { bootSolidModels } from 'soukai-solid';
import { IndexedDBEngine, bootModelsFromViteGlob, setEngine } from 'soukai';

setEngine(new IndexedDBEngine);
bootSolidModels();
bootModelsFromViteGlob(import.meta.globEager('@/models/*.ts'));
