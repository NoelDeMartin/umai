import { createStore } from 'vuex';
import { tap } from '@noeldemartin/utils';
import type { Plugin } from 'vue';

import Store from '@/framework/core/facades/Store';

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties {
        $store: NonNullable<typeof Store['instance']>;
    }

}

declare module '@/framework/core' {

    export interface Services {
        $store: NonNullable<typeof Store['instance']>;
    }

}

export default function(): Plugin {
    return tap(createStore({}), store => Store.setInstance(store));
}
