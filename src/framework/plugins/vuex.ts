import { createStore } from 'vuex';

import Services from '@/framework/services/Services';

const store = createStore({});

Services.$store = store;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties {
        $store: typeof store;
    }

}

declare module '@/framework/services/Services' {

    export interface Services {
        $store: typeof store;
    }

}

export default store;
