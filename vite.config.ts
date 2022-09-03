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
import { VitePWA } from 'vite-plugin-pwa';

import packageJson from './package.json';

const version = packageJson.version;
const sourceUrl = packageJson.repository.replace('github:', 'https://github.com/');
const sourceCommitHash = execSync('git rev-parse HEAD').toString();
const isTesting = process.argv.join(' ').includes('--mode testing');

export default defineConfig({
    plugins: [
        Vue({ reactivityTransform: true }),
        I18n({ include: resolve(__dirname, './src/lang/**') }),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Umai',
                short_name: 'Umai',
                description: 'Your favorite recipes manager',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
        Icons({
            customCollections: {
                app: FileSystemIconLoader('./src/assets/icons'),
            },
            iconCustomizer(_, icon, props) {
                if (icon === 'umai') {
                    props.width = '1.2em';
                    props.height = `${(1.2 * 369) / 1047}em`;
                }
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
            dts: false,
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
            '/src/main.ts': isTesting
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
    },
    esbuild: {
        keepNames: true,
    },
    define: {
        'process.env': {
            VUE_APP_VERSION: version,
            VUE_APP_SOURCE_URL: sourceUrl,
            VUE_APP_SOURCE_COMMIT_HASH: sourceCommitHash,
        },
    },
});
