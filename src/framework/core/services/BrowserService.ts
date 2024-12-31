import Files from '@/framework/core/facades/Files';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    supportsIndexedDB: boolean | null;
    supportsSharing: boolean;
    supportsPrinting: boolean;
    supportsWakeLocking: boolean;
    isFirefox: boolean;
}

export default class BrowserService extends Service<State> {

    public static persist: Array<keyof State> = ['supportsIndexedDB'];

    protected async boot(): Promise<void> {
        await super.boot();
        await this.initIndexedDBSupport();
    }

    protected getInitialState(): State {
        return {
            supportsIndexedDB: null,
            supportsSharing: 'share' in navigator,
            supportsPrinting: 'print' in window,
            supportsWakeLocking: 'wakeLock' in navigator,
            isFirefox: !!(navigator && navigator.userAgent && /firefox/i.test(navigator.userAgent)),
        };
    }

    private async initIndexedDBSupport(): Promise<void> {
        if (this.supportsIndexedDB !== null) {
            return;
        }

        this.setState({ supportsIndexedDB: await this.isIndexedDBSupported() });
    }

    private async isIndexedDBSupported(): Promise<boolean> {
        try {
            const stubUrl = 'browser-storage://capabilities-check';

            await Files.store(stubUrl, '', new Blob());
            await Files.delete(stubUrl);

            return true;
        } catch (e) {
            return false;
        }
    }

}

export default interface BrowserService extends IService<State> {}
