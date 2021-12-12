<template>
    <AppLayout>
        <router-view />
    </AppLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import I18n from '@/framework/core/facades/I18n';

const { t } = useI18n();

I18n.setInstance({ translate: t });
</script>
