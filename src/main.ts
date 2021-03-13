import { bootstrapApplication } from '@/framework';

import App from './App.vue';
import plugins from './plugins';
import services from './services';

bootstrapApplication(App, { plugins, services });
