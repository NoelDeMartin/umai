import Components from 'unplugin-vue-components/vite';
import I18n from '@intlify/vite-plugin-vue-i18n';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

import packageJson from './package.json';

const version = packageJson.version;
const isProduction = process.env.NODE_ENV === 'production';
const versionName = 'v' + version + (isProduction ? '' : ('-next-' + execSync('git rev-parse HEAD')));
const sourceUrl = packageJson.repository.replace('github:', 'https://github.com/');

export default defineConfig({
    plugins: [
        Vue({ reactivityTransform: true }),
        I18n({ include: resolve(__dirname, './src/lang/**') }),
        Icons({
            customCollections: {
                app: FileSystemIconLoader('./src/assets/icons'),
            },
        }),
        Components({
            resolvers: [
                HeadlessUiResolver(),
                IconsResolver({ customCollections: ['app'] }),
            ],
            dirs: [
                'src/assets/icons',
                'src/components',
                'src/routing/pages',
            ],
            deep: true,
        }),
        {
            name: 'jsonld',
            transform: (code, id) => id.endsWith('.jsonld') ? `export default ${code}` : null,
        },
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '/src/main.ts': process.env.NODE_ENV === 'testing'
                ? '/src/main.testing.ts'
                : '/src/main.ts',
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                404: resolve(__dirname, '404.html'),
            },
        },
        terserOptions: {
            keep_classnames: /Error$/,
            keep_fnames: /Error$/,
        },
    },
    define: {
        'process.env': {
            VUE_APP_VERSION: version,
            VUE_APP_VERSION_NAME: versionName,
            VUE_APP_SOURCE_URL: sourceUrl,
        },
    },
});
