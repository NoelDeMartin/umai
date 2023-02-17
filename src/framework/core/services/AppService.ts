import { updateLocationQueryParameters } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import { afterAnimationTime } from '@/framework/utils/dom';
import type { IService } from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';

import clientID from 'virtual:solid-clientid';
import type { ClientIDDocument } from 'virtual:solid-clientid';

interface State {
    isMounted: boolean;
    isOnboarding: boolean;
    onboardingCompleting: boolean;
}

export default class AppService extends Service<State> {

    public readonly name: string;
    public readonly clientID: ClientIDDocument;
    public readonly isDevelopment: boolean;
    public readonly isProduction: boolean;
    public readonly isStaging: boolean;
    public readonly isTesting: boolean;
    public readonly sourceUrl: string;
    public readonly version: string;
    public readonly versionName: string;
    public readonly releaseNotesUrl: string;

    constructor() {
        super();

        const sourceCommitHash = process.env.VUE_APP_SOURCE_COMMIT_HASH as string;

        this.name = clientID.client_name;
        this.clientID = clientID;
        this.isDevelopment = import.meta.env.DEV;
        this.isProduction = import.meta.env.PROD;
        this.isStaging = import.meta.env.MODE === 'staging';
        this.isTesting = import.meta.env.MODE === 'testing';
        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.version = process.env.VUE_APP_VERSION as string;
        this.versionName = this.formatVersionName(
            (this.isStaging || this.isDevelopment)
                ? ((this.isStaging ? 'staging.' : 'dev.') + sourceCommitHash.toString().substring(0, 7))
                : this.version,
        );
        this.releaseNotesUrl = this.sourceUrl + (
            (this.isStaging || this.isDevelopment)
                ? `/tree/${sourceCommitHash}`
                : `/releases/tag/${this.versionName}`
        );
    }

    public env<T = unknown>(property: string): T {
        return import.meta.env[`VITE_${property}`] as unknown as T;
    }

    public async reload(queryParameters?: Record<string, string | undefined>): Promise<void> {
        queryParameters && updateLocationQueryParameters(queryParameters);

        location.reload();

        await new Promise(() => {
            // stall until actual reload happens
        });
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.booted;
        await Cookbook.booted;

        this.isOnboarding = !Router.currentRouteIs('viewer')
            && !Auth.isLoggedIn()
            && Auth.previousSession === null
            && Cookbook.recipes.isEmpty();

        Events.on('recipe-created', async () => {
            if (!this.isOnboarding) {
                return;
            }

            this.setState({ isOnboarding: false, onboardingCompleting: true });

            await afterAnimationTime(500);

            this.setState({ onboardingCompleting: false });
        });

        Events.on('recipe-deleted', async () => {
            if (Auth.isLoggedIn() || Auth.previousSession !== null || Cookbook.recipes.length > 0) {
                return;
            }

            this.setState({ isOnboarding: true });
        });

        Events.on('logout', () => this.setState({ isOnboarding: true }));
        Events.once('application-mounted', () => this.setState({ isMounted: true }));
    }

    protected getInitialState(): State {
        return {
            isMounted: false,
            isOnboarding: false,
            onboardingCompleting: false,
        };
    }

    private formatVersionName(name: string) {
        return /\d/.test(name[0] ?? '') ? `v${name}` : name;
    }

}

export default interface AppService extends IService<State> {}
