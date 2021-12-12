import { nextTick } from 'vue';
import type { Directive } from 'vue';

export function defineDirective(directive: Directive): Directive {
    return directive;
}

export async function nextTicks(count: number): Promise<void> {
    while(count-- > 0) {
        await nextTick();
    }
}
