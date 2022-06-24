import { map, range } from '@noeldemartin/utils';

import { CloudStatus as CloudStatusEnum } from '@/framework/core/services/CloudService';
import { fakeRemoteModel } from '@/framework/testing/model-helpers';
import { meta, story, template } from '@sb/support/helpers';

import AppHeaderCloudStatus from '@/components/AppHeaderCloudStatus.vue';

interface Args {
    status: CloudStatusEnum;
    dirtyRemoteModels: number;
}

const Template = template<Args>(({ status, dirtyRemoteModels }) => {
    Storybook.$cloud.setState({
        status,
        dirtyRemoteModels: map(range(dirtyRemoteModels).map(fakeRemoteModel), 'url'),
    });

    return {
        components: { CloudStatus: AppHeaderCloudStatus },
        template: '<CloudStatus />',
    };
});

export const Online = story(Template, { status: CloudStatusEnum.Online });
export const OnlineWithUpdates = story(Template, { status: CloudStatusEnum.Online, dirtyRemoteModels: 3 });
export const OnlineWithManyUpdates = story(Template, { status: CloudStatusEnum.Online, dirtyRemoteModels: 100 });
export const Syncing = story(Template, { status: CloudStatusEnum.Syncing });
export const Offline = story(Template, { status: CloudStatusEnum.Offline });
export const Disconnected = story(Template, { status: CloudStatusEnum.Disconnected });

export default meta<Args>({
    component: AppHeaderCloudStatus,
    title: 'AppHeader/CloudStatus',
    argTypes: {
        status: {
            control: { type: 'select' },
            options: CloudStatusEnum,
        },
        dirtyRemoteModels: {
            control: { type: 'number' },
        },
    },
    args: {
        status: CloudStatusEnum.Disconnected,
        dirtyRemoteModels: 0,
    },
});
