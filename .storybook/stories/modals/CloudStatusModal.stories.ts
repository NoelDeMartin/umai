import { map, range } from '@noeldemartin/utils';
import { onMounted, onUnmounted, ref } from 'vue';

import { meta, story, template } from '@sb/support/helpers';

import { CloudStatus as CloudStatusEnum } from '@/framework/core/services/CloudService';
import { fakeRemoteModel } from '@/framework/testing/model-helpers';

import AppOverlays from '@/components/AppOverlays.vue';
import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';

interface Args {
    status: CloudStatusEnum;
    dirtyRemoteModels: number;
    webId: string;
    loginUrl: string;
}

const Template = template<Args>(({ status, dirtyRemoteModels, webId, loginUrl }) => {
    Storybook.$cloud.setState({
        status,
        dirtyRemoteModels: map(range(dirtyRemoteModels).map(fakeRemoteModel), 'url'),
    });

    Storybook.$auth.setState({
        session: webId
            ? {
                user: {
                    webId,
                    storageUrls: [],
                },
                loginUrl: '',

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                authenticator: null as any,
            }
            : null,
        previousSession: loginUrl
            ? {
                loginUrl,

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                authenticator: null as any,
            }
            : null,
    });

    return {
        components: {
            AppOverlays,
        },
        setup() {
            const modalId = ref<string | null>(null);
            async function open() {
                const modal = await Storybook.$ui.openModal(CloudStatusModal);

                modalId.value = modal.id;
            }

            onMounted(open);
            onUnmounted(() => modalId.value && Storybook.$ui.closeModal(modalId.value, null, false));

            return { open };
        },
        template: `
            <div>
                <AppOverlays />
                <button @click="open">Open modal</button>
            </div>
        `,
    };
});

export const Online = story(Template, { status: CloudStatusEnum.Online, webId: 'https://alice.solidcommunity.net' });
export const OnlineWithUpdates = story(Template, {
    status: CloudStatusEnum.Online,
    webId: 'https://alice.solidcommunity.net',
    dirtyRemoteModels: 3,
});
export const OnlineWithManyUpdates = story(Template, {
    status: CloudStatusEnum.Online,
    webId: 'https://alice.solidcommunity.net',
    dirtyRemoteModels: 100,
});
export const Syncing = story(Template, { status: CloudStatusEnum.Syncing });
export const Offline = story(Template, { status: CloudStatusEnum.Offline });
export const Disconnected = story(Template, { status: CloudStatusEnum.Disconnected });
export const Reconnect = story(Template, {
    status: CloudStatusEnum.Disconnected,
    loginUrl: 'https://alice.solidcommunity.net',
});

export default meta<Args>({
    component: CloudStatusModal,
    title: 'WIP/CloudStatusModal',
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
        webId: '',
        loginUrl: '',
    },
});
