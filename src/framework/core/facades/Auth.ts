import AuthService from '@/framework/core/services/AuthService';
import { facade } from '@/framework/core/facades';

export default facade(new AuthService);
