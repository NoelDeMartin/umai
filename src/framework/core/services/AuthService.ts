import { createPrivateTypeIndex, fetchLoginUserProfile } from '@noeldemartin/solid-utils';
import { fail, objectWithout, tap, urlRoot } from '@noeldemartin/utils';
import { SolidACLAuthorization } from 'soukai-solid';
import type { Fetch, SolidUserProfile } from '@noeldemartin/solid-utils';

import App from '@/framework/core/facades/App';
import AuthenticationCancelledError from '@/framework/auth/errors/AuthenticationCancelledError';
import Errors from '@/framework/core/facades/Errors';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import UI from '@/framework/core/facades/UI';
import { getAuthenticator } from '@/framework/auth';
import { translate } from '@/framework/utils/translate';
import type Authenticator from '@/framework/auth/Authenticator';
import type { AuthenticatorName } from '@/framework/auth';
import type { AuthSession } from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import { CoreColor } from '@/components/core';

interface State {
    autoReconnect: boolean;
    session: AuthSession | null;
    profiles: Record<string, SolidUserProfile>;
    dismissed: boolean;
    preferredAuthenticator: AuthenticatorName | null;
    ongoing: boolean;
    stale: boolean;
    loginError: unknown | null;
    previousSession: {
        authenticator: AuthenticatorName;
        loginUrl: string;
    } | null;
}

interface ComputedState {
    authenticator: Authenticator | null;
    fetch: Fetch;
    loggedIn: boolean;
    wasLoggedIn: boolean;
    hasLoggedIn: boolean;
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

    public static persist: Array<keyof State> = ['autoReconnect', 'dismissed', 'previousSession', 'profiles'];

    public isLoggedIn(): this is { session: AuthSession; user: SolidUserProfile; authenticator: Authenticator } {
        return this.loggedIn;
    }

    public requireAuthenticator(): Authenticator {
        return this.authenticator ?? fail('Could not get authenticator');
    }

    public requireUser(): SolidUserProfile {
        return this.user ?? fail('Could not get user profile');
    }

    public async getUserProfile(url: string): Promise<SolidUserProfile | null> {
        return this.profiles[url]
            ?? tap(await fetchLoginUserProfile(url), profile => profile && this.rememberProfile(profile));
    }

    public async refreshUserProfile(): Promise<void> {
        if (!this.isLoggedIn())
            return;

        this.setState({ profiles: objectWithout(this.profiles, [this.user.webId]) });

        const user = await this.getUserProfile(this.user.webId);

        if (!user)
            throw new Error('User profile went missing');

        this.setState({
            session: {
                ...this.session,
                user,
            },
        });
    }

    public async login(loginUrl: string, authenticatorName?: AuthenticatorName): Promise<boolean> {
        authenticatorName = authenticatorName ?? this.preferredAuthenticator ?? 'default';

        if (this.loggedIn) {
            return true;
        }

        if (this.ongoing) {
            throw new Error('Authentication already in progress');
        }

        const staleTimeout = setTimeout(() => (this.stale = true), 10000);
        this.ongoing = true;

        try {
            const profile = await this.getUserProfile(loginUrl);
            const oidcIssuerUrl = profile?.oidcIssuerUrl ?? urlRoot(profile?.webId ?? loginUrl);
            const authenticator = await this.bootAuthenticator(authenticatorName);

            this.setState({
                dismissed: false,
                previousSession: { loginUrl, authenticator: authenticatorName },
            });

            await authenticator.login(oidcIssuerUrl);

            return true;
        } catch (error) {
            if (error instanceof AuthenticationCancelledError) {
                return false;
            }

            App.isMounted
                ? Errors.report(error)
                : this.setState({ loginError: error });

            return false;
        } finally {
            clearTimeout(staleTimeout);

            this.ongoing = false;
            this.stale = false;
        }
    }

    public async reconnect(): Promise<void> {
        if (!this.previousSession || this.loggedIn) {
            return;
        }

        await this.login(this.previousSession.loginUrl, this.previousSession.authenticator);
    }

    public async logout(force: boolean = false): Promise<void> {
        // TODO show a different message if there are pending local modifications
        const confirmLogout = force || await UI.confirm({
            title: translate('menu.logOut_confirmTitle'),
            message: translate('menu.logOut_confirmMessage'),
            acceptText: translate('menu.logOut'),
            acceptColor: CoreColor.Danger,
        });

        if (!confirmLogout) {
            return;
        }

        if (!this.previousSession) {
            return;
        }

        this.setState({ previousSession: null });

        if (this.isLoggedIn()) {
            await this.authenticator.logout();
        }

        Events.emit('logout');
    }

    public dismiss(): void {
        this.setState({ dismissed: true });
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
        await Errors.ready;

        const url = new URL(location.href);

        if (url.searchParams.has('authenticator'))
            this.setState({ preferredAuthenticator: url.searchParams.get('authenticator') as AuthenticatorName });

        this.previousSession && await this.bootAuthenticator(this.previousSession.authenticator);
        this.autoReconnect && await this.reconnect();
    }

    protected getInitialState(): State {
        return {
            autoReconnect: true,
            loginError: null,
            session: null,
            dismissed: false,
            ongoing: false,
            stale: false,
            previousSession: null,
            preferredAuthenticator: null,
            profiles: {},
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            authenticator: state => state.session?.authenticator ?? null,
            fetch: (_, { authenticator }) => authenticator?.getAuthenticatedFetch() ?? window.fetch.bind(window),
            loggedIn: state => !!state.session,
            wasLoggedIn: state => !!state.previousSession?.loginUrl,
            hasLoggedIn: (_, state) => state.loggedIn || state.wasLoggedIn,
            user: state => state.session?.user ?? null,
        };
    }

    private async bootAuthenticator(name: AuthenticatorName): Promise<Authenticator> {
        const authenticator = getAuthenticator(name);

        authenticator.addListener({
            onSessionStarted: async session => {
                this.setState({ session });

                SolidACLAuthorization.setEngine(session.authenticator.engine);

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
