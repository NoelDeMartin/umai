export interface IHandleIncomingRedirectOptions {
    restorePreviousSession?: boolean;
    useEssSession?: boolean;
    url?: string;
}

export interface ISessionInfo {
    isLoggedIn: boolean;
    webId?: string;
    clientAppId?: string;
    sessionId: string;
    expirationDate?: number;
}

export default interface ILoginInputOptions {
    oidcIssuer?: string;
    redirectUrl?: string;
    clientId?: string;
    clientSecret?: string;
    clientName?: string;
    popUp?: boolean;
    handleRedirect?: (redirectUrl: string) => unknown;
    tokenType?: 'DPoP' | 'Bearer';
    refreshToken?: string;
}

export declare const fetch: (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
export declare const handleIncomingRedirect: (inputOptions?: string | IHandleIncomingRedirectOptions) => Promise<ISessionInfo | undefined>;
export declare const login: (options: ILoginInputOptions) => Promise<void>;
export declare const logout: () => Promise<void>;
