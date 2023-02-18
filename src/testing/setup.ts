import { installJestPlugin } from '@noeldemartin/solid-utils';

installJestPlugin();

expect.extend({
    toEqualClasses(received: string, expected: string) {
        const normalizedReceived = received.split(' ').sort().join(' ');
        const normalizedExpected = expected.split(' ').sort().join(' ');
        const pass = normalizedReceived === normalizedExpected;

        return {
            pass,
            message: pass
                ? () => [
                    'Expected classes to equal',
                    this.utils.matcherHint('toEqualClasses'),
                    [
                        `Expected: ${this.utils.printExpected(normalizedExpected)}`,
                        `Received: ${this.utils.printReceived(normalizedReceived)}`,
                    ].join('\n'),
                ].join('\n\n')
                : () => [
                    'Expected classes to equal',
                    this.utils.matcherHint('toEqualClasses'),
                    [
                        `Expected: ${this.utils.printExpected(normalizedExpected)}`,
                        `Received: ${this.utils.printReceived(normalizedReceived)}`,
                    ].join('\n'),
                ].join('\n\n'),
        };
    },
});
