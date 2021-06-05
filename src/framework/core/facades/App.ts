import { facade } from '@/framework/core/facades';
import AppService from '@/framework/core/services/AppService';

export default facade(new AppService);
