import { Storage } from '@noeldemartin/utils';
import type { Fetch } from 'soukai-solid';

import Authenticator from '@/framework/auth/Authenticator';
import type { AuthSession , User } from '@/framework/auth/Authenticator';

const STORAGE_KEY = 'local-storage-authenticator';

export class LocalStorageAuthenticator extends Authenticator {

    public get fetch(): Fetch {
        return window.fetch.bind(window);
    }

    public async login(): Promise<AuthSession> {
        const user: User = {
            name: prompt('What is your name?', 'John Doe') ?? 'John Doe',
            storageUrl: prompt('Where is your storage?', 'http://localhost:4000/') ?? 'http://localhost:4000/',
        };

        Storage.set(STORAGE_KEY, user);

        return this.startSession({ user });
    }

    public async logout(): Promise<void> {
        Storage.remove(STORAGE_KEY);

        await this.endSession();
    }

    protected async restoreSession(): Promise<void> {
        if (!Storage.has(STORAGE_KEY))
            return;

        await this.startSession({ user: Storage.require<User>(STORAGE_KEY) });
    }

}
