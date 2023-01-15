declare module 'virtual:solid-clientid' {

    export interface ClientIDDocument {
        '@context': 'https://www.w3.org/ns/solid/oidc-context.jsonld';
        'client_id': string;
        'client_name': string;
        'redirect_uris': string[];
        'client_uri': string;
        'logo_uri': string;
        'scope': string;
        'grant_types': string[];
        'response_types': string[];
    }

    const clientID: ClientIDDocument;

    export default clientID;

}
