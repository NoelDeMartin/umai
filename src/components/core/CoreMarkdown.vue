<template>
    <root />
</template>

<script setup lang="ts">
import { h } from 'vue';
import { isInstanceOf } from '@noeldemartin/utils';

import AutoLinking from '@/framework/core/facades/AutoLinking';
import { booleanProp, objectProp, requiredStringProp, stringProp } from '@/framework/utils/vue';
import { safeHtml } from '@/framework/utils/sanitization';
import type { LinkCapture } from '@/framework/core/services/AutoLinkingService';

import { renderMarkdown } from '@/utils/markdown';

const { text, actions, tag, raw, heading, inline, autoLink } = defineProps({
    text: requiredStringProp(),
    actions: objectProp<Record<string, () => unknown>>(() => ({})),
    tag: stringProp('div'),
    raw: booleanProp(),
    heading: booleanProp(),
    inline: booleanProp(),
    autoLink: stringProp(),
});

const root = () => h(tag, {
    class: raw || 'prose',
    innerHTML: safeHtml(html),
    onClick,
});

const html = $computed(() => {
    const html = renderMarkdown(text);

    if (heading) {
        return html.replace('<p>', '<span>').replace('</p>', '</span>');
    }

    if (inline) {
        return html.replace('<p>', '').replace('</p>', '');
    }

    return html;
});

async function onClick(event: Event) {
    const { target } = event;

    if (!isInstanceOf(target, HTMLElement)) {
        return;
    }

    if (target.dataset.markdownAction) {
        actions[target.dataset.markdownAction]?.();

        return;
    }

    captureAutoLink(target, event);
}

async function handleCapture(event: Event, capture: LinkCapture) {
    if (!capture) {
        return;
    }

    event.preventDefault();

    await capture();
}

async function handleDeferredCapture(event: Event, target: HTMLAnchorElement, deferredCapture: Promise<LinkCapture>) {
    event.preventDefault();

    const capture = await deferredCapture;

    if (!capture) {
        target.target === '_blank' ? window.open(target.href) : location.href = target.href;

        return;
    }

    await capture();
}

async function captureAutoLink(target: HTMLElement, event: Event) {
    if (target.dataset.disableAutoLinking || !isInstanceOf(target, HTMLAnchorElement)) {
        return;
    }

    const capture = AutoLinking.captureLink(
        target.href,
        autoLink ? `${autoLink}, default` : 'default',
    );

    if (capture instanceof Promise) {
        handleDeferredCapture(event, target, capture);

        return;
    }

    await handleCapture(event, capture);
}
</script>
