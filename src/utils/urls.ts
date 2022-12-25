export function urlWithoutProtocol(url: string): string {
    return url.replace(/^[^:]+:\/\//, '');
}
