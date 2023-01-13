declare module 'virtual:webid' {

    export interface WebId {
        clientId: string;
        clientName: string;
        redirectUrl: string;
    }

    const webId: WebId;

    export default webId;

}
