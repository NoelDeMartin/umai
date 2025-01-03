import { PromisedValue } from '@noeldemartin/utils';

import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {}

export default class CacheService extends Service<State> {

    private cache?: PromisedValue<Cache> = undefined;

    public async get(url: string): Promise<Response | null> {
        const cache = await this.open();
        const response = await cache.match(url);

        return response ?? null;
    }

    public async store(url: string, response: Response): Promise<void> {
        const cache = await this.open();

        await cache.put(url, response);
    }

    public async replace(url: string, response: Response): Promise<void> {
        const cache = await this.open();
        const keys = await cache.keys(url);

        if (keys.length === 0) {
            return;
        }

        await cache.put(url, response);
    }

    protected async open(): Promise<Cache> {
        if (!this.cache) {
            const cache = new PromisedValue<Cache>();

            caches.open('app').then(instance => cache.resolve(instance));

            this.cache = cache;
        }

        return this.cache;
    }

}

export default interface CacheService extends IService<State> {}
