import type { Plugin } from 'vite';

import type { ClientIDDocument } from 'virtual:solid-clientid';

interface VitePluginSolidClientIDOptions {
    name: string;
    domain: string;
    logoPublicPath: string;
}

function generateClientID(options: VitePluginSolidClientIDOptions): ClientIDDocument {
    const domain = options.domain.endsWith('/') ? options.domain : `${options.domain}/`;
    const logoPublicPath = options.logoPublicPath.startsWith('/')
        ? options.logoPublicPath.slice(1)
        : options.logoPublicPath;

    return {
        '@context': 'https://www.w3.org/ns/solid/oidc-context.jsonld',
        'client_id': `${domain}clientid.jsonld`,
        'client_name': options.name,
        'redirect_uris': [domain],
        'client_uri': domain,
        'logo_uri': domain + logoPublicPath,
        'scope': 'openid profile offline_access webid',
        'grant_types': ['refresh_token', 'authorization_code'],
        'response_types': ['code'],
    };
}

export function VitePluginSolidClientID(options: VitePluginSolidClientIDOptions): Plugin {
    let serverDomain: string | null;
    const devOptions = (): VitePluginSolidClientIDOptions => ({
        ...options,
        domain: serverDomain ?? options.domain,
    });

    return {
        name: 'vite-plugin-solid-clientid',
        configureServer(server) {
            server.watcher.on('ready', () => {
                serverDomain = server.resolvedUrls?.local?.[0] ?? null;
            });

            server.middlewares.use((req, res, next) => {
                if (!req.url?.endsWith('/clientid.jsonld')) {
                    next();

                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/ld+json');
                res.write(JSON.stringify(generateClientID(devOptions())), 'utf-8');
                res.end();
            });
        },
        generateBundle(_, bundle) {
            bundle['clientid.jsonld'] = {
                isAsset: true,
                type: 'asset',
                name: undefined,
                fileName: 'clientid.jsonld',
                source: JSON.stringify(generateClientID(options)),
            };
        },
        resolveId(id) {
            if (id !== 'virtual:solid-clientid') {
                return;
            }

            return id;
        },
        load(id) {
            if (id !== 'virtual:solid-clientid') {
                return;
            }

            return `export default ${JSON.stringify(generateClientID(devOptions()))};`;
        },
    };
}
