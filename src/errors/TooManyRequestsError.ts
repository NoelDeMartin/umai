import { JSError } from '@noeldemartin/utils';

export default class TooManyRequestsError extends JSError {

    constructor(public url: string, public proxyUrl: string) {
        super(`Too many requests for ${url}`);
    }

}
