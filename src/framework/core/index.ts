import Auth from './facades/Auth';
import Events from './facades/Events';

export const services = {
    $auth: Auth,
    $events: Events,
};

type BaseServices = typeof services;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export interface Services extends BaseServices {}
