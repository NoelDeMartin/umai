import { PromisedValue, tap } from '@noeldemartin/utils';

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

    protected async open(): Promise<Cache> {
        return this.cache = this.cache
            ?? tap(new PromisedValue(), cache => {
                caches.open('app').then(instance => cache.resolve(instance));
            });
    }

}

export default interface CacheService extends IService<State> {}
