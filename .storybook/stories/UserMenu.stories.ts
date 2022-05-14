import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import LocalStorageAuthenticator from '@/framework/auth/authenticators/LocalStorageAuthenticator';
import { meta, story, template } from '@sb/support/helpers';

import UserMenu from '@/components/UserMenu.vue';

enum User {
    Alice = 'alice',
    Bob = 'bob',
    Anonymous = 'anonymous',
}

interface Args {
    user: null | User;
}

const profiles: Record<User, SolidUserProfile> = {
    [User.Alice]: {
        name: 'Alice',
        webId: 'https://example.com/alice/profile/card#me',
        storageUrls: [],
        avatarUrl: 'https://thispersondoesnotexist.com/image',
    },
    [User.Bob]: {
        name: 'Bob',
        webId: 'https://example.com/bob/profile/card#me',
        storageUrls: [],
    },
    [User.Anonymous]: {
        webId: 'https://example.com/anonymous/profile/card#me',
        storageUrls: [],
    },
};

const Template = template<Args>(({ user }) => {
    Storybook.$auth.setState({
        session: user
            ? {
                user: profiles[user],
                loginUrl: 'https://example.com',
                authenticator: new LocalStorageAuthenticator,
            }
            : null,
    });

    return {
        components: { UserMenu },
        template: '<div class="flex justify-end"><UserMenu /></div>',
    };
});

export const Alice = story(Template, { user: User.Alice });
export const Bob = story(Template, { user: User.Bob });
export const Anonymous = story(Template, { user: User.Anonymous });
export const Guest = story(Template);

export default meta<Args>({
    component: UserMenu,
    title: 'WIP/UserMenu',
    argTypes: {
        user: {
            control: { type: 'select' },
            options: {
                ...User,
                Guest: null,
            },
        },
    },
    args: {
        user: null,
    },
});
