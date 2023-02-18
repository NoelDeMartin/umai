import { mock } from '@noeldemartin/utils';

import Cloud from '@/framework/core/facades/Cloud';

import type CloudService from './CloudService';

type MockedMethods = 'sync';

export default class CloudServiceMock implements Pick<CloudService, MockedMethods> {

    public use(): void {
        Cloud.setInstance(mock<CloudService>(this));
    }

    public async sync(): Promise<void> {
        //
    }

}
