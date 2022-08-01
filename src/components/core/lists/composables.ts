import { arrayWithItemAt, arrayWithoutIndex, tap } from '@noeldemartin/utils';
import { computed, inject, nextTick } from 'vue';
import type { Closure } from '@noeldemartin/utils';
import type { ComputedRef, ExtractPropTypes, Ref } from 'vue';

import { arrayProp, objectProp, requiredNumberProp, requiredStringProp, stringProp } from '@/framework/utils/vue';
import { elementIsInViewport } from '@/framework/utils/dom';
import { focusable } from '@/framework/components/headless';
import type Form from '@/framework/forms/Form';
import type { IFocusable } from '@/framework/components/headless';

import CoreListItemValue from './CoreListItemValue';
import { animateItemDeparture } from './animations';

const listProps = {
    name: stringProp(),
    modelValue: arrayProp<CoreListItemValue>(),
    addLabel: requiredStringProp(),
    itemLabel: stringProp(),
    itemPlaceholder: stringProp(),
    itemRemoveLabel: stringProp(),
    itemRemoveA11yLabel: stringProp(),
};

const listItemProps = {
    index: requiredNumberProp(),
    name: stringProp(),
    label: stringProp(),
    removeLabel: stringProp(),
    removeA11yLabel: stringProp(),
    placeholder: stringProp(),
    modelValue: objectProp(() => new CoreListItemValue()),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;
type ExtractEmitTypes<T> = UnionToIntersection<{
    [key in keyof T]: T[key] extends (...args: infer Args) => infer Return
        ? (event: key, ...rest: Args) => Return
        : never;
}[keyof T]>;

interface CoreListEvents {
    'update:modelValue'(value: CoreListItemValue[]): void;
    'submit'(): void;
}

interface CoreListItemEvents {
    'add'(): void;
    'remove'(): void;
    'update:modelValue'(value: CoreListItemValue): void;
    'submit'(): void;
}

export interface CoreListComposable {
    items: ComputedRef<CoreListItemValue[]>;
    itemsProps: ComputedRef<Record<string, unknown>[]>;
    itemsEvents: ComputedRef<Record<string, Closure>[]>;
    focusableApi: IFocusable;
    addItem(index: number): Promise<void>;
    removeItem(index: number): Promise<void>;
    updateItem(index: number, newItem: CoreListItemValue): Promise<void>;
    updateItems(newItems: CoreListItemValue[]): Promise<void>;
}

export interface CoreListItemComposable {
    inputProps: ComputedRef<Record<string, unknown>>;
    inputEvents: ComputedRef<Record<string, Closure>>;
    removeButtonProps: ComputedRef<Record<string, unknown>>;
    removeButtonEvents: ComputedRef<Record<string, Closure>>;
    focusableApi: IFocusable;
}

export function useListProps(): typeof listProps {
    return listProps;
}

export function useListEmits(): (keyof CoreListEvents)[] {
    return ['update:modelValue', 'submit'];
}

export function useList(
    $root: Ref<HTMLElement | null>,
    $itemInputs: Ref<IFocusable[]>,
    $addButton: Ref<IFocusable | null>,
    props: ExtractPropTypes<typeof listProps>,
    emit: ExtractEmitTypes<CoreListEvents>,
): CoreListComposable {
    const form = inject<Form | null>('form', null);
    const formInput = computed(() => form?.input<CoreListItemValue[]>(props.name ?? '') ?? null);
    const items = computed(() => formInput.value?.value ?? props.modelValue);
    const itemsProps = computed(() => items.value.map((item, index) => ({
        index,
        name: props.name && `${props.name}[${index}]`,
        label: props.itemLabel,
        placeholder: props.itemPlaceholder,
        removeLabel: props.itemRemoveLabel,
        removeA11yLabel: props.itemRemoveA11yLabel,
        modelValue: item,
    })));
    const itemsEvents = computed(() => items.value.map((item, index) => ({
        'add': () => addItem(index),
        'remove': () => removeItem(index),
        'update:modelValue': (value: CoreListItemValue) => updateItem(index, value),
        'submit': () => emit('submit'),
    })));
    const focusableApi: IFocusable = {
        getRootElement() {
            return $root.value ?? null;
        },
        focus(options = {}) {
            const $lastTextArea = $itemInputs.value?.[$itemInputs.value.length - 1];
            const $addButtonRoot = $addButton.value?.getRootElement();
            const scrollIntoView = options.scrollIntoView ?? true;

            if (!$lastTextArea || !$addButtonRoot)
                return;

            if (scrollIntoView && !elementIsInViewport($addButtonRoot))
                this.scrollIntoView();

            $lastTextArea.focus({ scrollIntoView: false });
        },
        isFocused() {
            return !!$root.value?.querySelector(':focus');
        },
        blur() {
            $root.value?.querySelector<HTMLElement>(':focus')?.blur();
        },
        scrollIntoView() {
            $addButton.value?.scrollIntoView();
        },
    };

    async function addItem(index: number) {
        updateItems(arrayWithItemAt(items.value, new CoreListItemValue(), index));

        await nextTick();

        $itemInputs.value[index + 1]?.focus();
    }

    async function removeItem(index: number) {
        $itemInputs.value[index === 0 ? 1 : index - 1]?.focus();

        const $listItem = $itemInputs.value[index]?.getRootElement()?.parentElement;

        $listItem && await animateItemDeparture($listItem);

        updateItems(arrayWithoutIndex(items.value, index));
    }

    async function updateItem(index: number, newItem: CoreListItemValue) {
        updateItems([
            ...items.value.slice(0, index),
            newItem,
            ...items.value.slice(index + 1),
        ]);
    }

    async function updateItems(newItems: CoreListItemValue[]) {
        emit('update:modelValue', tap(newItems, value => formInput.value?.update(value)));
    }

    return {
        items,
        itemsProps,
        itemsEvents,
        focusableApi,
        addItem,
        removeItem,
        updateItem,
        updateItems,
    };
}

export function useListItemProps(): typeof listItemProps {
    return listItemProps;
}

export function useListItemEmits(): (keyof CoreListItemEvents)[] {
    return ['add', 'remove', 'update:modelValue', 'submit'];
}

export function useListItem(
    $root: Ref<HTMLElement | null>,
    $input: Ref<IFocusable | null>,
    props: ExtractPropTypes<typeof listItemProps>,
    emit: ExtractEmitTypes<CoreListItemEvents>,
): CoreListItemComposable {
    const item = props.modelValue;
    const texts = computed(() => ({
        input: props.label && replaceArguments(props.label),
        remove: props.removeLabel && replaceArguments(props.removeLabel),
        removeA11y: props.removeA11yLabel && replaceArguments(props.removeA11yLabel),
    }));
    const inputProps = computed(() => ({
        name: props.name,
        label: texts.value.input,
        placeholder: props.placeholder,
        modelValue: item.value,
    }));
    const inputEvents = computed(() => ({
        'update:modelValue': (value: string) => emit('update:modelValue', item.update(value)),
        'keydown': (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'enter' || event.shiftKey) {
                return;
            }

            event.preventDefault();

            event.ctrlKey ? emit('submit') : emit('add');
        },
    }));
    const removeButtonProps = computed(() => ({
        'aria-label': texts.value.removeA11y,
        'title': texts.value.remove,
    }));
    const removeButtonEvents = computed(() => ({
        click: () => emit('remove'),
    }));
    const focusableApi: IFocusable = {
        ...focusable($input),

        getRootElement() {
            return $root.value;
        },
    };

    function replaceArguments(text: string): string {
        return text
            .replace(':position', (props.index + 1).toString())
            .replace(':index', props.index.toString())
            .replace(':value', item.value);
    }

    return {
        inputProps,
        inputEvents,
        removeButtonProps,
        removeButtonEvents,
        focusableApi,
    };
}
