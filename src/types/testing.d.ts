import '';

declare global {

    interface TestingRuntime {
        start(): Promise<void>;
    }

    interface Window {
        testing?: TestingRuntime;
    }

}
