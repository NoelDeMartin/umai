import { nextTick } from 'vue';
import type { Directive, PropType } from 'vue';

type Prop<T> = {
    type: PropType<T>;
    validator?(value: unknown): boolean;
} & ({ required: true } | { default: T });

export function booleanProp(): Prop<boolean> {
    return {
        type: Boolean,
        default: false,
    };
}

export function defineDirective(directive: Directive): Directive {
    return directive;
}

export function enumProp<Enum>(enumeration: Enum): Prop<Enum[keyof Enum]> {
    const values = Object.values(enumeration);

    return {
        type: String as unknown as PropType<Enum[keyof Enum]>,
        default: values[0] ?? null,
        validator: value => values.includes(value),
    };
}

export async function nextTicks(count: number): Promise<void> {
    while (count-- > 0) {
        await nextTick();
    }
}
