// Workaround for https://github.com/facebook/jest/issues/12183
jest.mock('./rules', () => ({}));

import { tt } from '@noeldemartin/utils';
import type { Equals, Expect } from '@noeldemartin/utils';

import { FormInputType, reactiveForm } from './';
import type { FormInputDefinition, FormObjectInput } from './';

describe('Forms', () => {

    it('has correct types', async () => {
        // Arrange
        interface Baz {}

        // Act
        const form = reactiveForm({
            foo: {
                type: FormInputType.String,
            },
            bar: {
                type: FormInputType.Number,
                multi: true,
            },
            baz: {
                type: FormInputType.Object as FormObjectInput<Baz>,
            },
            qux: {
                type: FormInputType.String,
                default: 3, // TODO this should throw a type error
            },
        });

        // Assert
        tt<
            Expect<Equals<typeof form['foo'], string>> |
            Expect<Equals<typeof form['bar'], number[]>> |
            Expect<Equals<typeof form['baz'], Baz>> |
            Expect<Equals<FormInputDefinition<FormInputType.String, false>['default'], string | undefined>> |
            true
        >();
    });

});
