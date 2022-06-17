import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import { afterAnimationTime } from '@/framework/utils/dom';
import type { IService } from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';

interface State {
    isOnboarding: boolean;
    onboardingCompleting: boolean;
}

export default class AppService extends Service<State> {

    public name: string = 'Solid App';

    public sourceUrl: string = '';
    public version: string = '';
    public versionName: string = '';

    public get releaseNotesUrl(): string {
        return `${this.sourceUrl}/releases/tag/${this.versionName}`;
    }

    public env<T = unknown>(property: string): T {
        return import.meta.env[`VITE_${property}`] as unknown as T;
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.ready;
        await Cookbook.ready;

        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.version = process.env.VUE_APP_VERSION as string;
        this.versionName = process.env.VUE_APP_VERSION_NAME as string;
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
            if (Auth.isLoggedIn() || Auth.previousSession !== null) {
                return;
            }

            this.setState({ isOnboarding: true });
        });
    }

    protected getInitialState(): State {
        return {
            isOnboarding: false,
            onboardingCompleting: false,
        };
    }

}

export default interface AppService extends IService<State> {}
