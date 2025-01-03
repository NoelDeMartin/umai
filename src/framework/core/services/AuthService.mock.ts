import { fail, mock } from '@noeldemartin/utils';
import type { Fetch, SolidUserProfile } from '@noeldemartin/solid-utils';

import Auth from '@/framework/core/facades/Auth';
import AuthenticatorMock from '@/framework/auth/Authenticator.mock';
import type Authenticator from '@/framework/auth/Authenticator';
import type { AuthSession } from '@/framework/auth/Authenticator';

import type AuthService from './AuthService';

type MockedMethods = 'isLoggedIn' | 'requireUser' | 'requireAuthenticator';

export default class AuthServiceMock implements Pick<AuthService, MockedMethods> {

    private user: SolidUserProfile | null = null;
    private authenticator: Authenticator | null = null;

    public use(fetch: Fetch): void {
        Auth.setInstance(mock<AuthService>(this));

        this.user = mock<SolidUserProfile>();
        this.authenticator = mock<Authenticator>(new AuthenticatorMock(fetch));
    }

    public mockUser(user: Partial<SolidUserProfile> = {}): void {
        this.user = mock<SolidUserProfile>(user);
    }

    public isLoggedIn(): this is { session: AuthSession; user: SolidUserProfile; authenticator: Authenticator } {
        return !!this.user;
    }

    public requireUser(): SolidUserProfile {
        return this.user ?? fail('User mock not set up');
    }

    public requireAuthenticator(): Authenticator {
        return this.authenticator ?? fail('Authenticator mock not set up');
    }

}
