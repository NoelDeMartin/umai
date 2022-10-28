import App from './facades/App';
import Auth from './facades/Auth';
import Browser from './facades/Browser';
import Cache from './facades/Cache';
import Cloud from './facades/Cloud';
import ElementTransitions from './facades/ElementTransitions';
import Errors from './facades/Errors';
import Events from './facades/Events';
import Files from './facades/Files';
import Lang from './facades/Lang';
import Network from './facades/Network';
import UI from './facades/UI';

export const services = {
    $app: App,
    $auth: Auth,
    $browser: Browser,
    $cache: Cache,
    $cloud: Cloud,
    $elementTransitions: ElementTransitions,
    $errors: Errors,
    $events: Events,
    $files: Files,
    $lang: Lang,
    $network: Network,
    $ui: UI,
};

type BaseServices = typeof services;

declare module '@vue/runtime-core' {

    export interface ComponentCustomProperties extends Services {}

}

export interface Services extends BaseServices {}
