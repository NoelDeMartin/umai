import { Cookbook } from './Cookbook';

declare module '@/framework/core' {

    type AppServices = typeof services;

    export interface Services extends AppServices {}

}

const services = {
    $cookbook: Cookbook,
};

export default services;
