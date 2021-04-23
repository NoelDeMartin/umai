import { facade } from '@/framework/core/facades';

import CloudService from '@/services/CloudService';

export default facade(new CloudService);
