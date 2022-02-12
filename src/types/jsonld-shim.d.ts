declare module '*.jsonld' {
    import type { JsonLD } from '@noeldemartin/solid-utils';

    const jsonld: JsonLD;
    export default jsonld;
}
