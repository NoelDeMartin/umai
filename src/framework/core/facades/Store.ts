import type { Store } from 'vuex';

import { facade } from '@/framework/core/facades';

export default facade<Store<unknown>>();
