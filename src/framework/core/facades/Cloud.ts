import { facade } from '@/framework/core/facades';
import CloudService from '@/framework/core/services/CloudService';

export default facade(new CloudService());
