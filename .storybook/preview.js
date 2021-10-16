import { app } from '@storybook/vue3';
import { bootSolidModels } from 'soukai-solid';
import { createStore } from 'vuex';

import Cloud from '@/framework/core/facades/Cloud';
import CloudService from '@/framework/core/services/CloudService';
import Store from '@/framework/core/facades/Store';
import { mockService } from '@/framework/testing/service-helpers';

import './styles.css';

const services = { $cloud: Cloud };

Store.setInstance(createStore());
Cloud.setInstance(mockService('cloud', CloudService));

bootSolidModels();

app.config.globalProperties = services;
window.Storybook = services;
