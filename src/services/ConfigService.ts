import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    useProxy: boolean;
    proxyUrl: string | null;
}

export default class ConfigService extends Service<State> {

    public static persist: Array<keyof State> = ['useProxy', 'proxyUrl'];

    public updateProxy(useProxy: boolean, proxyUrl: string): void {
        this.setState({
            useProxy,
            proxyUrl,
        });
    }

    protected getInitialState(): State {
        return {
            useProxy: true,
            proxyUrl: null,
        };
    }

}

export default interface ConfigService extends IService<State> {}
