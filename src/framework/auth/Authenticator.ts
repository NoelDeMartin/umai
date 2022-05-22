import { PromisedValue, arr, fail } from '@noeldemartin/utils';
import { SolidEngine } from 'soukai-solid';
import type { Engine } from 'soukai';
import type { Fetch } from 'soukai-solid';
import type { FluentArray } from '@noeldemartin/utils';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import type { AuthenticatorName } from '@/framework/auth';

export interface AuthSession {
    user: SolidUserProfile;
    loginUrl: string;
    authenticator: Authenticator;
}

export interface AuthenticatorListener {
    onSessionStarted?: (session: AuthSession) => Promise<void> | void;
    onSessionEnded?: () => Promise<void> | void;
    onAuthenticatedFetchReady?: (fetch: Fetch) => Promise<void> | void;
}

export default abstract class Authenticator {

    public name!: AuthenticatorName;

    private authenticatedFetch?: Fetch;
    private booted?: PromisedValue<void>;
    private listeners: FluentArray<AuthenticatorListener> = arr<AuthenticatorListener>([]);
    private _engine?: SolidEngine;

    public abstract login(loginUrl: string, user?: SolidUserProfile): Promise<AuthSession>;

    public abstract logout(): Promise<void>;

    public get engine(): Engine {
        this._engine = this._engine ?? new SolidEngine(this.requireAuthenticatedFetch());

        return this._engine;
    }

    public getAuthenticatedFetch(): Fetch | null {
        return this.authenticatedFetch ?? null;
    }

    public requireAuthenticatedFetch(): Fetch {
        return this.authenticatedFetch ?? fail('Authenticated fetch is not ready');
    }

    public addListener(listener: AuthenticatorListener): () => void {
        if (!this.listeners.includes(listener)) this.listeners.push(listener);

        return () => {
            this.removeListener(listener);
        };
    }

    public removeListener(listener: AuthenticatorListener): void {
        if (!this.listeners.includes(listener)) return;

        this.listeners.remove(listener);
    }

    public async boot(): Promise<void> {
        if (this.booted) return this.booted;

        this.booted = new PromisedValue();

        await this.restoreSession();

        this.booted.resolve();
    }

    protected abstract restoreSession(): Promise<void>;

    protected async initAuthenticatedFetch(fetch: Fetch): Promise<void> {
        this.authenticatedFetch = fetch;

        await Promise.all(
            this.listeners.toArray().map(async listener => {
                await listener.onAuthenticatedFetchReady?.call(listener, fetch);
            }),
        );
    }

    protected async startSession(sessionData: Omit<AuthSession, 'authenticator'>): Promise<AuthSession> {
        const session: AuthSession = {
            authenticator: this,
            ...sessionData,
        };

        await Promise.all(
            this.listeners.toArray().map(async listener => {
                await listener.onSessionStarted?.call(listener, session);
            }),
        );

        return session;
    }

    protected async endSession(): Promise<void> {
        await Promise.all(
            this.listeners.toArray().map(async listener => {
                await listener.onSessionEnded?.call(listener);
            }),
        );
    }

}
