import { app } from '@storybook/vue3';
import { bootSolidModels } from 'soukai-solid';
import { createStore } from 'vuex';

import i18n from '@/framework/plugins/i18n';
import Store from '@/framework/core/facades/Store';
import { mockService } from '@/framework/testing/service-helpers';
import { services } from '@/framework/core';
import type { MockServices } from '@/framework/testing/service-helpers';
import type { Services } from '@/framework/core';

import './styles.css';

bootSolidModels();
Store.setInstance(createStore({}));

for (const [name, facade] of Object.entries(services)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    facade.setInstance(mockService(name.slice(1), facade.instance?.static() as any) as any);
}

app.use(await i18n());
app.config.globalProperties = services;
window.Storybook = services as unknown as MockServices<Services>;
