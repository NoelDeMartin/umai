import { Storage, after } from '@noeldemartin/utils';
import type { Fetch } from 'soukai-solid';
import type { handleIncomingRedirect, login, logout } from '@webpack/inrupt';

import App from '@/framework/core/facades/App';
import AuthenticationTimeoutError from '@/framework/auth/errors/AuthenticationTimeoutError';
import Authenticator from '@/framework/auth/Authenticator';
import type { AuthSession } from '@/framework/auth/Authenticator';
import Auth from '@/framework/core/facades/Auth';

const STORAGE_KEY = 'inrupt-authenticator';

export default class InruptAuthenticator extends Authenticator {

    public fetch!: Fetch;
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

        await after({ seconds: 10 });

        // If we're still here after 10 seconds, something went wrong (or the network is too slow).
        throw new AuthenticationTimeoutError;
    }

    public async logout(): Promise<void> {
        await this._logout();
        await this.endSession();
    }

    protected async restoreSession(): Promise<void> {
        const { fetch, handleIncomingRedirect, login, logout } = await import('@webpack/inrupt');

        this.fetch = fetch;
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
            const user = await Auth.getUserProfile(session.webId);

            user && await this.startSession({ user, loginUrl });
        }
    }

}
