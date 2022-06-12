import Cloud from '@/framework/core/facades/Cloud';
import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';

import AppLoadingModal from '@/components/modals/AppLoadingModal.vue';
import Recipe from '@/models/Recipe';

import Config from './facades/Config';
import Cookbook from './facades/Cookbook';

const services = {
    $config: Config,
    $cookbook: Cookbook,
};

type AppServices = typeof services;

declare module '@/framework/core' {

    export interface Services extends AppServices {}

}

export function registerServices(): void {
    Cloud.registerHandler(Recipe, {
        isReady: () => !!Cookbook.cookbook.value,
        getLocalModels: () => Cookbook.allRecipes.toArray(),
    });

    UI.registerComponent(ApplicationComponent.LoadingModal, AppLoadingModal);
}

export default services;
