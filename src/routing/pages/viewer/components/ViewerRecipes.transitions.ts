import { afterAnimationFrame } from '@noeldemartin/utils';

import ElementTransitions from '@/framework/core/facades/ElementTransitions';

export async function leaveTransition(): Promise<void> {
    await afterAnimationFrame();
    await ElementTransitions.waitElementsReady('viewer-recipe');
}
