import Cookbook from './facades/Cookbook';

const services = {
    $cookbook: Cookbook,
};

type AppServices = typeof services;

declare module '@/framework/core' {

    export interface Services extends AppServices {}

}

export default services;
