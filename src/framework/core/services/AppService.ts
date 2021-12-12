import Service from '@/framework/core/Service';

export default class AppService extends Service {

    public name: string = 'Solid App';

    public sourceUrl!: string;
    public version!: string;
    public versionName!: string;

    protected async boot(): Promise<void> {
        await super.boot();

        this.sourceUrl = process.env.VUE_APP_SOURCE_URL as string;
        this.version = process.env.VUE_APP_VERSION as string;
        this.versionName = process.env.VUE_APP_VERSION_NAME as string;
    }

}
