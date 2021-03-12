import type { Store } from 'vuex';

export interface Services {
    $store: Store<unknown>;
}

const Services = {} as unknown as Services;

export default Services;
