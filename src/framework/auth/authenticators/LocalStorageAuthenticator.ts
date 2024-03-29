import { Storage, after, fail } from '@noeldemartin/utils';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import Authenticator from '@/framework/auth/Authenticator';
import AuthenticationCancelledError from '@/framework/auth/errors/AuthenticationCancelledError';
import type { AuthSession } from '@/framework/auth/Authenticator';

const STORAGE_KEY = 'local-storage-authenticator';

interface StorageData {
    loginUrl: string;
    user: SolidUserProfile;
}

export default class LocalStorageAuthenticator extends Authenticator {

    public async login(loginUrl: string, user?: SolidUserProfile): Promise<AuthSession> {
        const webId = prompt('What is your webId?', loginUrl) ?? fail<string>(AuthenticationCancelledError);

        user = user ?? {
            webId,
            name: prompt('What is your name?', 'John Doe') ?? fail(AuthenticationCancelledError),
            cloaked: false,
            writableProfileUrl: webId,
            storageUrls: [
                prompt('Where is your storage?', 'http://localhost:4000/') ?? fail(AuthenticationCancelledError),
            ],
            privateTypeIndexUrl:
                prompt('Where is the type index?', 'http://localhost:4000/settings/privateTypeIndex') ??
                fail(AuthenticationCancelledError),
            oidcIssuerUrl: loginUrl,
        };

        Storage.set<StorageData>(STORAGE_KEY, { loginUrl, user });

        // TODO support authentication without reloading
        location.reload();

        // Browser should redirect, so just make it wait for a while.
        await after({ seconds: 60 });

        return fail('Browser should have redirected, but it didn\'t');
    }

    public async logout(): Promise<void> {
        Storage.remove(STORAGE_KEY);

        await this.endSession();
    }

    protected async restoreSession(): Promise<void> {
        if (!Storage.has(STORAGE_KEY))
            return;

        await this.initAuthenticatedFetch(window.fetch.bind(window));
        await this.startSession(Storage.require<StorageData>(STORAGE_KEY));
    }

}
