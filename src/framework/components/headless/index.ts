import type { Component } from 'vue';

import { importModules } from '@/framework/utils/vite';

export default importModules<Component>(import.meta.globEager('@/framework/components/headless/*.vue'), '.vue');
