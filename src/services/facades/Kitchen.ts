import { facade } from '@noeldemartin/utils';

import KitchenService from '@/services/KitchenService';

export default facade(new KitchenService);
