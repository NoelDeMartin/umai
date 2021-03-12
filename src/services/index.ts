import Services from '@/framework/services/Services';

import { Auth } from '@/services/Auth';

const appServices = {
    $auth: new Auth,
};

Object.assign(Services, appServices);

type AppServices = typeof appServices;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends AppServices {}

}

declare module '@/framework/services/Services' {

    export interface Services extends AppServices {}

}

export default appServices;
