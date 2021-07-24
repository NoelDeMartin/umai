import { createPrivateTypeIndex, fetchLoginUserProfile } from '@noeldemartin/solid-utils';
import { fail, tap, urlRoot } from '@noeldemartin/utils';
import type { Fetch , SolidUserProfile } from '@noeldemartin/solid-utils';

import { getAuthenticator } from '@/framework/auth';
import AuthenticationCancelledError from '@/framework/auth/errors/AuthenticationCancelledError';
import AuthenticationTimeoutError from '@/framework/auth/errors/AuthenticationTimeoutError';
import Service from '@/framework/core/Service';
import Events from '@/framework/core/facades/Events';
import type Authenticator from '@/framework/auth/Authenticator';
import type { AuthenticatorName } from '@/framework/auth';
import type { AuthSession } from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions , IService } from '@/framework/core/Service';

interface State {
    session: AuthSession | null;
    profiles: Record<string, SolidUserProfile>;
    previousSession: {
        authenticator: AuthenticatorName;
        loginUrl: string;
    } | null;
}

interface ComputedState {
    authenticator: Authenticator | null;
    loggedIn: boolean;
    user: SolidUserProfile | null;
}

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'authenticated-fetch-ready': Fetch;
        'login': AuthSession;
        'logout': void;
    }

}

export default class AuthService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['previousSession', 'profiles'];

    public isLoggedIn(): this is { user: SolidUserProfile; authenticator: Authenticator } {
        return this.loggedIn;
    }

    public requireUser(): SolidUserProfile {
        return this.user ?? fail('Could not get user profile');
    }

    public async getUserProfile(url: string): Promise<SolidUserProfile | null> {
        return this.profiles[url]
            ?? tap(await fetchLoginUserProfile(url), profile => profile && this.rememberProfile(profile));
    }

    public async login(loginUrl: string, authenticatorName: AuthenticatorName = 'default'): Promise<void> {
        if (this.loggedIn)
            return;

        try {
            const profile = await this.getUserProfile(loginUrl);
            const oidcIssuerUrl = profile?.oidcIssuerUrl ?? urlRoot(profile?.webId ?? loginUrl);
            const authenticator = await this.bootAuthenticator(authenticatorName);

            this.setState({ previousSession: { loginUrl, authenticator: authenticatorName } });

            // TODO show "logging in..." alert
            await authenticator.login(oidcIssuerUrl);
        } catch (error) {
            if (error instanceof AuthenticationTimeoutError) {
                alert('This is taking too long...');

                return;
            }

            this.setState({ previousSession: null });

            if (error instanceof AuthenticationCancelledError)
                return;

            console.error(error);

            alert('Could not log in');
        }
    }

    public async reconnect(): Promise<void> {
        if (!this.previousSession)
            return;

        await this.login(this.previousSession.loginUrl, this.previousSession.authenticator);
    }

    public async logout(): Promise<void> {
        if (!this.previousSession)
            return;

        this.setState({ previousSession: null });

        if (!this.isLoggedIn()) {
            Events.emit('logout');

            return;
        }

        await this.authenticator.logout();
    }

    public async createPrivateTypeIndex(): Promise<string> {
        if (!this.isLoggedIn())
            throw new Error('Can\'t create a type index because the user is not logged in');

        const user = this.user;
        const typeIndexUrl = await createPrivateTypeIndex(user, this.authenticator.requireAuthenticatedFetch());

        return tap(typeIndexUrl, () => {
            user.privateTypeIndexUrl = typeIndexUrl;

            this.rememberProfile(user);
        });
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.previousSession && await this.bootAuthenticator(this.previousSession.authenticator);
    }

    protected getInitialState(): State {
        return {
            session: null,
            previousSession: null,
            profiles: {},
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            authenticator: state => state.session?.authenticator ?? null,
            loggedIn: state => state.session !== null,
            user: state => state.session?.user ?? null,
        };
    }

    private async bootAuthenticator(name: AuthenticatorName): Promise<Authenticator> {
        const authenticator = getAuthenticator(name);

        authenticator.addListener({
            onSessionStarted: async session => {
                this.setState({ session });

                await Events.emit('login', session);
            },
            onSessionEnded: async () => {
                this.setState({ session: null, previousSession: null });

                await Events.emit('logout');
            },
            onAuthenticatedFetchReady: fetch => Events.emit('authenticated-fetch-ready', fetch),
        });

        await authenticator.boot();

        return authenticator;
    }

    private rememberProfile(profile: SolidUserProfile): void {
        this.setState({
            profiles: {
                ...this.profiles,
                [profile.webId]: profile,
            },
        });
    }

}

export default interface AuthService extends IService<State, ComputedState> {}
