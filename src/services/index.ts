import { Cookbook } from './Cookbook';

const services = {
    $cookbook: Cookbook,
};

declare module '@/framework/core' {

    type AppServices = typeof services;

    export interface Services extends AppServices {}

}

export default services;
