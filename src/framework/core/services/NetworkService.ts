import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    online: boolean;
}

export default class NetworkService extends Service<State> {

    // TODO watch network

    protected getInitialState(): State {
        return {
            online: true,
        };
    }

}

export default interface NetworkService extends IService<State> {}
