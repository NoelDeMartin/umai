import type { App as VueApp } from 'vue';
import type { Attributes } from 'soukai';

import type { Services } from '@/framework/core';

import type Recipe from '@/models/Recipe';

interface TestingStartOptions {
    resetProfiles: boolean;
    beforeMount(app: VueApp): unknown | Promise<unknown>;
}

interface TestingRuntime {
    start(options?: Partial<TestingStartOptions>): Promise<void>;
    stop(): Promise<void>;
    queueAuthenticatedRequest(url: string, options: RequestInit): void;
    createRecipe(attributes: Attributes): Promise<Recipe>;
    getRecipe(uuid: string): Recipe | null;
    getService<T extends keyof Services>(name: T): Services[T];
}

declare global {

    interface Window {
        testing?: TestingRuntime;
    }

}
