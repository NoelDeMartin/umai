const Icons = require('unplugin-icons/vite');
const IconsResolver = require('unplugin-icons/resolver');
const Components = require('unplugin-vue-components/vite');
const { default: I18n } = require('@intlify/vite-plugin-vue-i18n');
const { loadConfigFromFile, mergeConfig } = require('vite');
const { resolve } = require('path');

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
                I18n({ include: resolve(__dirname, '../src/lang/**') }),
                Icons(),
            ],
        });
    },
};
