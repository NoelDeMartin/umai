import type { Directive } from 'vue';

import { importModules } from '@/framework/utils/vite';

export default {
    ...importModules<Directive>(import.meta.glob('@/directives/*.ts', { eager: true }), '.ts'),
    ...importModules<Directive>(import.meta.glob('@/framework/directives/*.ts', { eager: true }), '.ts'),
};
