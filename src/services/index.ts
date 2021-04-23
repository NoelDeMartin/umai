import Cloud from './facades/Cloud';
import Cookbook from './facades/Cookbook';

const services = {
    $cloud: Cloud,
    $cookbook: Cookbook,
};

type AppServices = typeof services;

declare module '@/framework/core' {

    export interface Services extends AppServices {}

}

export default services;
