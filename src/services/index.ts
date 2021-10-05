import Cloud from '@/framework/core/facades/Cloud';
import Recipe from '@/models/Recipe';
import Cookbook from './facades/Cookbook';

const services = {
    $cookbook: Cookbook,
};

type AppServices = typeof services;

declare module '@/framework/core' {

    export interface Services extends AppServices {}

}

export function registerCloudHandlers(): void {
    Cloud.registerHandler(Recipe, {
        isReady: () => !!Cookbook.cookbook.value,
        getLocalModels: () => Cookbook.recipes.toArray(),
    });
}

export default services;
