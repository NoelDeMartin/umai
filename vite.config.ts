import Components from 'unplugin-vue-components/vite';
import I18n from '@intlify/vite-plugin-vue-i18n';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        Vue(),
        I18n({ include: resolve(__dirname, './src/lang/**') }),
        Icons({
            customCollections: {
                umai: FileSystemIconLoader('./src/assets/icons'),
            },
        }),
        Components({
            resolvers: [
                HeadlessUiResolver(),
                IconsResolver({ customCollections: ['umai'] }),
            ],
            dirs: [
                'src/assets/icons',
                'src/components',
                'src/routing/pages',
            ],
            deep: true,
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@webpack': resolve(__dirname, './webpack/dist'),
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
});
