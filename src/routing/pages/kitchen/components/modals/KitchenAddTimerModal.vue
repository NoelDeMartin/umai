<template>
    <AppModal v-slot="{ close }" :title="$t('kitchen.timers.new.title')">
        <CoreForm :form="form" @submit="submit(close)">
            <div class="flex flex-col">
                <label for="name" class="font-medium text-gray-700">
                    {{ $t('kitchen.timers.new.name') }}
                </label>
                <CoreInput
                    id="name"
                    name="name"
                    class="mt-2"
                    bordered
                />
            </div>

            <div class="font-medium text-gray-700 mt-4">
                {{ $t('kitchen.timers.new.duration') }}
            </div>
            <div class="flex mt-2 space-y-2 flex-col md:space-y-0 md:space-x-2 md:flex-row">
                <label>
                    <CoreInput name="hours" type="number" class="w-20" />
                    <span class="text-sm">{{ $t('kitchen.timers.new.hours') }}</span>
                </label>
                <label>
                    <CoreInput name="minutes" type="number" class="w-20" />
                    <span class="text-sm">{{ $t('kitchen.timers.new.minutes') }}</span>
                </label>
                <label>
                    <CoreInput name="seconds" type="number" class="w-20" />
                    <span class="text-sm">{{ $t('kitchen.timers.new.seconds') }}</span>
                </label>
            </div>

            <div class="flex justify-end mt-4">
                <CoreButton type="submit">
                    {{ $t('kitchen.timers.new.submit') }}
                </CoreButton>
            </div>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import Router from '@/framework/core/facades/Router';
import { translate } from '@/framework/utils/translate';
import { FormInputType, reactiveForm } from '@/framework/forms';

import Timer from '@/models/Timer';
import Kitchen from '@/services/facades/Kitchen';
import Cookbook from '@/services/facades/Cookbook';

const form = reactiveForm({
    name: {
        type: FormInputType.String,
        default: translate('kitchen.timers.new.name_default', {
            count: Kitchen.timers.filter(timer => !timer.hasDishStep()).length + 1,
        }),
        rules: 'required',
    },
    hours: {
        type: FormInputType.Number,
        default: 0,
        rules: 'required',
    },
    minutes: {
        type: FormInputType.Number,
        default: 10,
        rules: 'required',
    },
    seconds: {
        type: FormInputType.Number,
        default: 0,
        rules: 'required',
    },
});

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

async function submit(close: Function) {
    const timer = new Timer(
        form.name,
        form.hours * 60 * 60 * 1000
                + clamp(form.minutes, 0, 60) * 60 * 1000
                + clamp(form.seconds, 0, 60) * 1000,
    );

    const recipe = Cookbook.recipes.first(recipe => recipe.slug === Router.currentRoute.value.params.recipe);
    const dish = recipe && Kitchen.findDish(recipe);

    dish && timer.setDish(dish);

    Kitchen.addTimer(timer);

    close();
}
</script>
