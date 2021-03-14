import Auth from './facades/Auth';
import Events from './facades/Events';

type BaseServices = typeof services;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export const services = {
    $auth: Auth,
    $events: Events,
};

export interface Services extends BaseServices {}
