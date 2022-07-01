import { meta, story } from '@sb/support/helpers';

import { SnackbarStyle } from '@/framework/core/services/UIService';
import type { SnackbarAction } from '@/framework/core/services/UIService';

import AppSnackbar from '@/components/AppSnackbar.vue';
import CoreMarkdown from '@/components/core/CoreMarkdown.vue';

interface Args {
    text: string;
    action: keyof typeof Actions;
    style: keyof typeof SnackbarStyle;
}

const Actions = {
    None: null,
    Edit: 'Edit',
    Delete: 'Delete',
    ViewDetails: 'View details',
};

const Meta = meta<Args>({
    component: AppSnackbar,
    title: 'App/Snackbar',
    args: {
        text: 'Something just happened!',
        action: 'None',
        style: 'Info',
    },
    argTypes: {
        text: { type: 'string' },
        action: {
            control: { type: 'select' },
            options: Object.keys(Actions),
        },
        style: {
            control: { type: 'radio' },
            options: Object.keys(SnackbarStyle),
        },
    },
});

export default Meta;

export const Playground = story<Args>((args) => ({
    components: { AppSnackbar, CoreMarkdown },
    data: () => args,
    computed: {
        actions(): SnackbarAction[] {
            if (args.action === 'None') {
                return [];
            }

            return [{
                text: Actions[args.action],
                handler() {
                    // nothing to do here
                },
            }];
        },
        styleValue(): SnackbarStyle {
            return SnackbarStyle[args.style];
        },
    },
    template: `
        <AppSnackbar :style="styleValue" :actions="actions">
            <CoreMarkdown raw :text="text" />
        </AppSnackbar>
    `,
}));
