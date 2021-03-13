import type { Services } from './Services';

import { Auth } from './Auth';
import { Events } from './Events';

const services = {
    $auth: new Auth,
    $events: new Events,
};

declare module '@/framework/services/Services' {

    type BaseServices = typeof services;

    export interface Services extends BaseServices {}

}

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export default services;
