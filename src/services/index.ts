import { Cookbook } from './Cookbook';

const services = {
    $cookbook: new Cookbook,
};

declare module '@/framework/core/Services' {

    type AppServices = typeof services;

    export interface Services extends AppServices {}

}

export default services;
