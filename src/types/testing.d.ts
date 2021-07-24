import '';

interface TestingStartOptions {
    resetProfiles: boolean;
}

interface TestingRuntime {
    start(options?: Partial<TestingStartOptions>): Promise<void>;
    queueAuthenticatedRequest(url: string, options: RequestInit): void;
}

declare global {

    interface Window {
        testing?: TestingRuntime;
    }

}
