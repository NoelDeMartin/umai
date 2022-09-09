import { JSError } from '@noeldemartin/utils';

export default class ServiceBootError extends JSError {

    constructor(serviceNamespace: string, cause: unknown) {
        super(`Service '${serviceNamespace}' failed booting`, { cause });
    }

}
