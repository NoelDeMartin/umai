import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {}

export default class CacheService extends Service<State> {

    private cache?: Cache;

    public async get(url: string): Promise<Response | null> {
        const cache = await this.open();
        const response = await cache.match(url);

        return response ?? null;
    }

    public async store(url: string, response: Response): Promise<void> {
        const cache = await this.open();

        await cache.put(url, response);
    }

    protected async open(): Promise<Cache> {
        if (!this.cache)
            this.cache = await caches.open('app');

        return this.cache;
    }

}

export default interface CacheService extends IService<State> {}
