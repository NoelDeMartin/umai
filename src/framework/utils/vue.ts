import { fail } from '@noeldemartin/utils';
import { inject, nextTick } from 'vue';
import type { Directive, InjectionKey, PropType } from 'vue';

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
        validator: (value) => values.includes(value),
    };
}

export function injectOrFail<T>(key: InjectionKey<T> | string, errorMessage?: string): T {
    return inject(key) ?? fail(errorMessage ?? `Could not resolve '${key}' injection key`);
}

export function mixedProp<T>(type: PropType<T>): Prop<T | null> {
    return {
        type,
        default: null,
    };
}

export async function nextTicks(count: number): Promise<void> {
    while (count-- > 0) {
        await nextTick();
    }
}

export function objectProp<T = Object>(): Prop<T | null>;
export function objectProp<T>(defaultValue: T): Prop<T>;
export function objectProp<T = Object>(defaultValue: T | null = null): Prop<T | null> {
    return {
        type: Object,
        default: defaultValue,
    };
}

export function requiredObjectProp<T = Object>(): Prop<T> {
    return {
        type: Object,
        required: true,
    };
}

export function requiredStringProp(): Prop<string> {
    return {
        type: String,
        required: true,
    };
}

export function stringProp(): Prop<string | null>;
export function stringProp(defaultValue: string): Prop<string>;
export function stringProp(defaultValue: string | null = null): Prop<string | null> {
    return {
        type: String,
        default: defaultValue,
    };
}
