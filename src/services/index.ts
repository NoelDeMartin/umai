import Cloud from '@/framework/core/facades/Cloud';
import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';

import AppLoadingModal from '@/components/modals/AppLoadingModal.vue';
import Recipe from '@/models/Recipe';

import Config from './facades/Config';
import Cookbook from './facades/Cookbook';
import Kitchen from './facades/Kitchen';
import Viewer from './facades/Viewer';

import RecipesCloudHandler from './cloud-handlers/recipes';

const services = {
    $config: Config,
    $cookbook: Cookbook,
    $kitchen: Kitchen,
    $viewer: Viewer,
};

type AppServices = typeof services;

declare module '@/framework/core' {

    export interface Services extends AppServices {}

}

export async function registerServices(): Promise<void> {
    await Cloud.registerHandler(Recipe, new RecipesCloudHandler());

    UI.registerComponent(ApplicationComponent.LoadingModal, AppLoadingModal);
}

export default services;
