import { SolidEngine } from 'soukai-solid';
import type { Engine } from 'soukai';
import type { Fetch } from '@noeldemartin/solid-utils';

import type Authenticator from './Authenticator';

type MockedMethods = 'requireAuthenticatedFetch';

export default class AuthenticatorMock implements Pick<Authenticator, MockedMethods> {

    public engine: Engine;
    private fetch: Fetch;

    constructor(fetch: Fetch) {
        this.fetch = fetch;
        this.engine = new SolidEngine(fetch);
    }

    public requireAuthenticatedFetch(): Fetch {
        return this.fetch;
    }

}
