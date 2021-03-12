import { createApp } from 'vue';

import App from './App.vue';
import plugins from './plugins';
import services from './services';

async function main(): Promise<void> {
    const app = createApp(App);

    plugins.forEach(plugin => app.use(plugin));
    Object.assign(app.config.globalProperties, services);

    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));

    app.mount('#app');
}

main();
