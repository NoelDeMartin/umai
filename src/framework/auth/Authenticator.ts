import { PromisedValue, arr, fail } from '@noeldemartin/utils';
import { SolidEngine } from 'soukai-solid';
import type { Closure, FluentArray, GetClosureArgs } from '@noeldemartin/utils';
import type { Engine } from 'soukai';
import type { Fetch } from 'soukai-solid';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import type { AuthenticatorName } from '@/framework/auth';
import type { ErrorReason } from '@/framework/core/services/ErrorsService';

type ListenerEvent = keyof AuthenticatorListener;
type ListenerEventPayload<Event extends ListenerEvent, Callback = AuthenticatorListener[Event]> =
    Callback extends Closure
        ? GetClosureArgs<Callback>
        : never;

export interface AuthSession {
    user: SolidUserProfile;
    loginUrl: string;
    authenticator: Authenticator;
}

export interface AuthenticatorListener {
    onSessionStarted?: (session: AuthSession) => Promise<void> | void;
    onSessionFailed?: (loginUrl: string, error: ErrorReason) => Promise<void> | void;
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
        if (!this.listeners.includes(listener))
            this.listeners.push(listener);

        return () => {
            this.removeListener(listener);
        };
    }

    public removeListener(listener: AuthenticatorListener): void {
        if (!this.listeners.includes(listener))
            return;

        this.listeners.remove(listener);
    }

    public async boot(): Promise<void> {
        if (this.booted)
            return this.booted;

        this.booted = new PromisedValue;

        await this.restoreSession();

        this.booted.resolve();
    }

    protected abstract restoreSession(): Promise<void>;

    protected async initAuthenticatedFetch(fetch: Fetch): Promise<void> {
        this.authenticatedFetch = fetch;

        await this.notifyListeners('onAuthenticatedFetchReady', fetch);
    }

    protected async startSession(sessionData: Omit<AuthSession, 'authenticator'>): Promise<AuthSession> {
        const session: AuthSession = {
            authenticator: this,
            ...sessionData,
        };

        await this.notifyListeners('onSessionStarted', session);

        return session;
    }

    protected async failSession(loginUrl: string, error: ErrorReason): Promise<void> {
        await this.notifyListeners('onSessionFailed', loginUrl, error);
    }

    protected async endSession(): Promise<void> {
        await this.notifyListeners('onSessionEnded');
    }

    protected async notifyListeners<Event extends ListenerEvent>(
        event: Event,
        ...payload: ListenerEventPayload<Event>
    ): Promise<void> {
        await Promise.all(
            this.listeners.toArray().map(
                async listener => {
                    const callback = listener[event] as Closure | undefined;

                    await callback?.(...payload);
                },
            ),
        );
    }

}
