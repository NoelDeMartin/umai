import type { Directive } from 'vue';

import { importModules } from '@/framework/utils/vite';

export default {
    ...importModules<Directive>(import.meta.globEager('@/directives/*.ts'), '.ts'),
    ...importModules<Directive>(import.meta.globEager('@/framework/directives/*.ts'), '.ts'),
};
