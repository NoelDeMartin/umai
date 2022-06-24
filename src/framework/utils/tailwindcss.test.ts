/* eslint-disable max-len */
import TailwindCSS from '@/framework/utils/tailwindcss';

describe('TailwindCSS utils', () => {

    it('merges classes', () => {
        expect(
            TailwindCSS.mergeClasses(
                'text-red hover:bg-red focus:bg-red focus:hover:bg-red focus:ring-red foo',
                'text-green hover:bg-green focus:bg-green bar',
                'text-blue focus:hover:bg-blue focus:ring-blue baz',
            ),
        ).toEqualClasses('text-blue hover:bg-green focus:bg-green focus:hover:bg-blue focus:ring-blue foo bar baz');

        expect(
            TailwindCSS.mergeClasses(
                'ring-2 ring-green ring-offset-2 ring-offset-green',
                'ring-4 ring-offset-0',
            ),
        ).toEqualClasses('ring-4 ring-green ring-offset-0 ring-offset-green');

        expect(
            TailwindCSS.mergeClasses(
                'text-red',
                'text-lg',
            ),
        ).toEqualClasses('text-lg text-red');
    });

});
