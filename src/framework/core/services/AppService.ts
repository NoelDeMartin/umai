import Auth from '@/framework/core/facades/Auth';
import Service from '@/framework/core/Service';

import Cookbook from '@/services/facades/Cookbook';

export default class AppService extends Service {

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

    public get isOnboarding(): boolean {
        return !Auth.isLoggedIn() && Auth.previousSession === null && Cookbook.recipes.isEmpty();
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.version = process.env.VUE_APP_VERSION as string;
        this.versionName = process.env.VUE_APP_VERSION_NAME as string;
    }

}
