import { Storage, after, fail } from '@noeldemartin/utils';
import type { Fetch } from 'soukai-solid';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import Authenticator from '@/framework/auth/Authenticator';
import AuthenticationCancelledError from '@/framework/auth/errors/AuthenticationCancelledError';
import AuthenticationTimeoutError from '@/framework/auth/errors/AuthenticationTimeoutError';
import type { AuthSession } from '@/framework/auth/Authenticator';

const STORAGE_KEY = 'local-storage-authenticator';

interface StorageData {
    loginUrl: string;
    user: SolidUserProfile;
}

export default class LocalStorageAuthenticator extends Authenticator {

    public get fetch(): Fetch {
        return window.fetch.bind(window);
    }

    public async login(loginUrl: string, user?: SolidUserProfile): Promise<AuthSession> {
        user = user ?? {
            name: prompt('What is your name?', 'John Doe') ?? fail(AuthenticationCancelledError),
            storageUrls: [
                prompt('Where is your storage?', 'http://localhost:4000/') ?? fail(AuthenticationCancelledError),
            ],
            privateTypeIndexUrl:
                prompt('Where is the type index?', 'http://localhost:4000/settings/privateTypeIndex.ttl') ??
                fail(AuthenticationCancelledError),
            oidcIssuerUrl: loginUrl,
        } as SolidUserProfile;

        Storage.set<StorageData>(STORAGE_KEY, { loginUrl, user });

        // TODO support authentication without reloading
        location.reload();

        await after({ seconds: 10 });

        throw new AuthenticationTimeoutError();
    }

    public async logout(): Promise<void> {
        Storage.remove(STORAGE_KEY);

        await this.endSession();
    }

    protected async restoreSession(): Promise<void> {
        if (!Storage.has(STORAGE_KEY))
            return;

        await this.startSession(Storage.require<StorageData>(STORAGE_KEY));
    }

}
