import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    proxyUrl: string | false | null;
}

export default class ConfigService extends Service<State> {

    public static persist: Array<keyof State> = ['proxyUrl'];

    protected getInitialState(): State {
        return {
            proxyUrl: null,
        };
    }

}

export default interface ConfigService extends IService<State> {}
