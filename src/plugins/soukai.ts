import { IndexedDBEngine, bootModelsFromViteGlob, setEngine } from 'soukai';

setEngine(new IndexedDBEngine);
bootModelsFromViteGlob(import.meta.globEager('../models/*.ts'));
