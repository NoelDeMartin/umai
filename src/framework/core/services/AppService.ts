import { updateLocationQueryParameters } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import { afterAnimationTime } from '@/framework/utils/dom';
import type { IService } from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';

interface State {
    isMounted: boolean;
    isOnboarding: boolean;
    onboardingCompleting: boolean;
}

export default class AppService extends Service<State> {

    public name: string = 'Solid App';
    public isDevelopment: boolean = false;
    public isProduction: boolean = false;
    public isStaging: boolean = false;
    public sourceUrl: string = '';
    public version: string = '';
    public versionName: string = '';
    public releaseNotesUrl: string = '';

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
        await Auth.ready;
        await Cookbook.ready;

        const sourceCommitHash = process.env.VUE_APP_SOURCE_COMMIT_HASH as string;

        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.isDevelopment = import.meta.env.DEV;
        this.isProduction = import.meta.env.PROD;
        this.isStaging = import.meta.env.MODE === 'staging';
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
        this.isOnboarding = !Auth.isLoggedIn() && Auth.previousSession === null && Cookbook.recipes.isEmpty();

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
