import '';

declare global {

    namespace jest {

        // TODO generate automatically
        interface Matchers<R> {
            toEqualClasses(classes: string): R;
        }

    }

}
