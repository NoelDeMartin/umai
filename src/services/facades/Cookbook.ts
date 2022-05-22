import { facade } from '@/framework/core/facades';

import CookbookService from '@/services/CookbookService';

export default facade(new CookbookService());
