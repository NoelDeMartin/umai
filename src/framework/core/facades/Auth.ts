import { facade } from '@/framework/core/facades';
import AuthService from '@/framework/core/services/AuthService';

export default facade(new AuthService());
