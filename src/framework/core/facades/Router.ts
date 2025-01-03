import { facade, fail } from '@noeldemartin/utils';
import type { Router } from 'vue-router';

export default facade(() => fail<Router>('Router facade cannot be initialized lazily'));
