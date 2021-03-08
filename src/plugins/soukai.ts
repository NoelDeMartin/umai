import Soukai, { IndexedDBEngine } from 'soukai';
import SoukaiSolid from 'soukai-solid';

import Recipe from '@/models/Recipe';

SoukaiSolid.loadSolidModels();
Soukai.loadModels({ Recipe });
Soukai.useEngine(new IndexedDBEngine);
