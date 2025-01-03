import { facade, fail } from '@noeldemartin/utils';
import type { Store } from 'vuex';

export default facade(() => fail<Store<unknown>>('Store facade cannot be initialized lazily'));
