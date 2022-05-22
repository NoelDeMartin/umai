import { Storage, after } from '@noeldemartin/utils';
import type { Fetch } from 'soukai-solid';
import type { handleIncomingRedirect, login, logout } from '@inrupt/solid-client-authn-browser';

import App from '@/framework/core/facades/App';
import Auth from '@/framework/core/facades/Auth';
import Authenticator from '@/framework/auth/Authenticator';
import type { AuthSession } from '@/framework/auth/Authenticator';

const STORAGE_KEY = 'inrupt-authenticator';

export default class InruptAuthenticator extends Authenticator {

    private _fetch!: Fetch;
    private _login!: typeof login;
    private _logout!: typeof logout;
    private _handleIncomingRedirect!: typeof handleIncomingRedirect;

    public async login(loginUrl: string): Promise<AuthSession> {
        Storage.set<string>(STORAGE_KEY, loginUrl);

        await this._login({
            oidcIssuer: loginUrl,
            redirectUrl: window.location.href,
            clientName: App.name,
        });

        // Browser should redirect, so just make it wait for a while.
        await after({ seconds: 60 });

        return fail('Browser should have redirected, but it didn\'t');
    }

    public async logout(): Promise<void> {
        await this._logout();
        await this.endSession();
    }

    protected async restoreSession(): Promise<void> {
        const { fetch, handleIncomingRedirect, login, logout } = await import('@inrupt/solid-client-authn-browser');

        this._fetch = fetch;
        this._login = login;
        this._logout = logout;
        this._handleIncomingRedirect = handleIncomingRedirect;

        await this.loginFromRedirect();
    }

    protected async loginFromRedirect(): Promise<void> {
        if (!Storage.has(STORAGE_KEY))
            return;

        const loginUrl = Storage.pull<string>(STORAGE_KEY) as string;
        const session = await this._handleIncomingRedirect(window.location.href);

        if (session?.isLoggedIn && session.webId) {
            await this.initAuthenticatedFetch(this._fetch);

            const user = await Auth.getUserProfile(session.webId);

            user && await this.startSession({ user, loginUrl });
        }
    }

}
