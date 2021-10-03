import type Recipe from '@/models/Recipe';

interface TestingStartOptions {
    resetProfiles: boolean;
}

interface TestingRuntime {
    start(options?: Partial<TestingStartOptions>): Promise<void>;
    stop(): Promise<void>;
    queueAuthenticatedRequest(url: string, options: RequestInit): void;
    createRecipe(name: string): Promise<Recipe>;
}

declare global {

    interface Window {
        testing?: TestingRuntime;
    }

}
