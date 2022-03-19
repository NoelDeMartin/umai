import type { Attributes } from 'soukai';

import type Recipe from '@/models/Recipe';

interface TestingStartOptions {
    resetProfiles: boolean;
}

interface TestingRuntime {
    start(options?: Partial<TestingStartOptions>): Promise<void>;
    stop(): Promise<void>;
    queueAuthenticatedRequest(url: string, options: RequestInit): void;
    createRecipe(attributes: Attributes): Promise<Recipe>;
}

declare global {

    interface Window {
        testing?: TestingRuntime;
    }

}
