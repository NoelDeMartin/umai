import { facade } from '@noeldemartin/utils';

import CookbookService from '@/services/CookbookService';

export default facade(new CookbookService);
