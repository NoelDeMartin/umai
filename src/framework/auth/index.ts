import LocalStorageAuthenticator from './authenticators/LocalStorageAuthenticator';
import InruptAuthenticator from './authenticators/InruptAuthenticator';
import type Authenticator from './Authenticator';

const _authenticators = {} as Authenticators;

type BaseAuthenticators = typeof authenticators;

export const authenticators = {
    localStorage: new LocalStorageAuthenticator(),
    inrupt: new InruptAuthenticator(),
};

export function setDefaultAuthenticator(authenticator: Authenticator): void {
    _authenticators.default = authenticator;
}

export function getAuthenticator<T extends AuthenticatorName>(name: T): Authenticators[T] {
    return _authenticators[name];
}

export function registerAuthenticator<T extends AuthenticatorName>(name: T, authenticator: Authenticators[T]): void {
    _authenticators[name] = authenticator;

    authenticator.name = authenticator.name ?? name;
}

export type AuthenticatorName = keyof Authenticators;

export interface Authenticators extends BaseAuthenticators {
    default: Authenticator;
}
