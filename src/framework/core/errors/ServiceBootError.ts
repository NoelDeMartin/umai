import { Error } from '@noeldemartin/utils';

export default class ServiceBootError extends Error {

    constructor(serviceNamespace: string, cause: unknown) {
        super(`Service '${serviceNamespace}' failed booting`, { cause });
    }

}
