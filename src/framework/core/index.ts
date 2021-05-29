import Auth from './facades/Auth';
import Cloud from './facades/Cloud';
import Events from './facades/Events';
import UI from './facades/UI';

export const services = {
    $auth: Auth,
    $cloud: Cloud,
    $events: Events,
    $ui: UI,
};

type BaseServices = typeof services;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export interface Services extends BaseServices {}
