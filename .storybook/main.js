const Icons = require('unplugin-icons/vite');
const IconsResolver = require('unplugin-icons/resolver');
const Components = require('unplugin-vue-components/vite');
const { resolve } = require('path');
const { loadConfigFromFile, mergeConfig } = require('vite');

module.exports = {
    stories: [
        './stories/**/*.ts',
    ],
    addons: [
        '@storybook/addon-essentials',
    ],
    core: {
        builder: 'storybook-builder-vite',
    },
    async viteFinal(defaultConfig) {
        const { config: projectConfig } = await loadConfigFromFile(resolve(__dirname, '../vite.config.ts'));

        projectConfig.resolve.alias['@sb'] = resolve(__dirname, './');

        return mergeConfig(defaultConfig, {
            ...projectConfig,
            plugins: [
                Components({ resolvers: IconsResolver() }),
                Icons(),
            ],
        });
    },
};
