import { Auth } from './services/Auth';
import { Events } from './services/Events';
import type { Services } from './Services';

export const services = {
    $auth: new Auth,
    $events: new Events,
};

declare module '@/framework/core/Services' {

    type BaseServices = typeof services;

    export interface Services extends BaseServices {}

}

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}
