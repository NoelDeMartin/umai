<template>
    <AppPage class="pb-4">
        <h1 class="text-2xl font-medium mt-4">
            {{ $t('history.title', { recipe: recipe.name }) }}
        </h1>
        <CoreMarkdown :text="$t('history.description')" class="mt-3" />
        <table v-if="history.length > 0" class="mt-4 w-full">
            <tr v-for="{ timestamp, date, datetime, changes } of history" :key="timestamp">
                <th class="w-0 whitespace-nowrap px-2">
                    <time :datetime="datetime">{{ date }}</time>
                </th>
                <td>
                    <CoreJSON :json="changes" />
                </td>
            </tr>
        </table>
        <p v-else class="bg-green-200 font-medium tracking-wide p-4 rounded-md text-green-800 max-w-prose mt-4">
            {{ $t('history.empty') }}
        </p>
    </AppPage>
</template>

<script setup lang="ts">
import {
    AddPropertyOperation,
    DeleteOperation,
    PropertyOperation,
    RemovePropertyOperation,
    SetPropertyOperation,
    UnsetPropertyOperation,
} from 'soukai-solid';
import { arrayFrom, isInstanceOf, tap } from '@noeldemartin/utils';
import type { Operation } from 'soukai-solid';

import { requiredObjectProp } from '@/framework/utils/vue';

import Recipe from '@/models/Recipe';
import RecipeInstructionsStep from '@/models/RecipeInstructionsStep';

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

function addOperation(history: Record<number, Record<string, Operation[]>>, operation: Operation) {
    const timestamp = operation.date.getTime();
    const resourceOperations =
            history[timestamp] =
            history[timestamp] ?? {} as Record<string, Operation[]>;
    const operations =
            resourceOperations[operation.resourceUrl] =
            resourceOperations[operation.resourceUrl] ?? [] as Operation[];

    operations.push(operation);
}

function applyOperationToDiff(diff: Record<string, unknown>, operation: Operation): void {
    if (operation instanceof DeleteOperation) {
        addDiffOperation(diff, '$delete', true);

        return;
    }

    if (!isInstanceOf(operation, PropertyOperation)) {
        addDiffOperation(diff, '$unknownOperation', operation.static().modelName);

        return;
    }

    const field = operation.resourceUrl === recipe.url
        ? Recipe.getRdfPropertyField(operation.property)
        : RecipeInstructionsStep.getRdfPropertyField(operation.property);

    if (!field) {
        addDiffOperation(diff, '$invalidOperation', operation.getAttributes());

        return;
    }

    if (operation instanceof SetPropertyOperation) {
        addDiffOperation(diff, field, { $set: operation.value });

        return;
    }

    if (operation instanceof AddPropertyOperation) {
        addDiffOperation(diff, field, { $add: operation.value });

        return;
    }

    if (operation instanceof RemovePropertyOperation) {
        addDiffOperation(diff, field, { $remove: operation.value });

        return;
    }

    if (operation instanceof UnsetPropertyOperation) {
        addDiffOperation(diff, field, { $unset: true });

        return;
    }

    addDiffOperation(diff, field, { $unknownPropertyOperation: operation.static().modelName });
}

function addDiffOperation(diff: Record<string, unknown>, field: string, value: unknown) {
    if (field in diff) {
        diff[field] = [...arrayFrom(diff[field]), value];

        return;
    }

    diff[field] = value;
}

function renderDate(date: Date): string {
    const pad = (value: number, length: number = 2) => value.toString().padStart(length, '0');
    const day = [pad(date.getDate()), pad(date.getMonth()), pad(date.getFullYear(), 4)].join('/');
    const hour = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
    const milliseconds = pad(date.getMilliseconds(), 3);

    return `${day} ${hour}.${milliseconds}`;
}

const history = $computed(() => {
    const history: Record<number, Record<string, Operation[]>> = {};

    recipe.operations?.forEach(operation => addOperation(history, operation));
    recipe.instructions?.forEach(
        instruction => instruction.operations.forEach(operation => addOperation(history, operation)),
    );

    return Object
        .keys(history)
        .map(timestamp => parseInt(timestamp))
        .sort()
        .reverse()
        .map(timestamp => ({
            timestamp,
            date: renderDate(new Date(timestamp)),
            datetime: new Date(timestamp).toISOString(),
            changes: Object.entries(history[timestamp] ?? {}).reduce((changes, [resourceUrl, operations]) => {
                changes[resourceUrl] = tap(
                    {},
                    diff => operations.forEach(operation => applyOperationToDiff(diff, operation)),
                );

                return changes;
            }, {} as Record<string, unknown>),
        }));
});
</script>
