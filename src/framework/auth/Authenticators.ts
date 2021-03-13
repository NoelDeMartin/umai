import type Authenticator from '@/framework/auth/Authenticator';

export interface Authenticators {
    default: Authenticator;
}

export type AuthenticatorName = keyof Authenticators;

export default {} as Authenticators;
