import App from './facades/App';
import Auth from './facades/Auth';
import Cloud from './facades/Cloud';
import ElementTransitions from './facades/ElementTransitions';
import Events from './facades/Events';
import UI from './facades/UI';

export const services = {
    $app: App,
    $auth: Auth,
    $cloud: Cloud,
    $elementTransitions: ElementTransitions,
    $events: Events,
    $ui: UI,
};

type BaseServices = typeof services;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export interface Services extends BaseServices {}
