import { LocalStorageAuthenticator } from './authenticators/LocalStorageAuthenticator';

export const authenticators = {
    localStorage: new LocalStorageAuthenticator,
};

declare module '@/framework/auth/Authenticators' {

    type BaseAuthenticators = typeof authenticators;

    export interface Authenticators extends BaseAuthenticators {}

}
