import type { MockServices } from '@/framework/testing/service-helpers';
import type { Services } from '@/framework/core';

declare global {

    const Storybook: MockServices<Services>;

}
