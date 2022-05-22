import { facade } from '@/framework/core/facades';

import ConfigService from '@/services/ConfigService';

export default facade(new ConfigService());
