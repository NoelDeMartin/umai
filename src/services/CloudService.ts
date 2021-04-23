import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    pendingOperations: number;
}

export default class CloudService extends Service<State> {

    public async sync(): Promise<void> {
        //
    }

    protected getInitialState(): State {
        return { pendingOperations: 0 };
    }

}

export default interface CloudService extends IService<State> {}
