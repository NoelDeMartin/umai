import { facade } from '@/framework/core/facades';
import EventsService from '@/framework/core/services/EventsService';

export default facade(new EventsService);
