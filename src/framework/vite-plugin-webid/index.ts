import type { Plugin } from 'vite';

import type { WebId } from 'virtual:webid';

interface WebIdOptions {
    name: string;
    domain: string;
    logoPublicPath: string;
}

function normalizeDomain(domain: string): string {
    if (domain.endsWith('/')) {
        return domain;
    }

    return `${domain}/`;
}

function generateWebId(options: WebIdOptions): string {
    const domain = normalizeDomain(options.domain);
    const logoPublicPath = options.logoPublicPath.startsWith('/')
        ? options.logoPublicPath.slice(1)
        : options.logoPublicPath;

    return JSON.stringify({
        '@context': ['https://www.w3.org/ns/solid/oidc-context.jsonld'],
        'client_id': `${domain}webid.json`,
        'client_name': options.name,
        'redirect_uris': [domain],
        'client_uri': domain,
        'logo_uri': domain + logoPublicPath,
        'scope': 'openid profile offline_access webid',
        'grant_types': ['refresh_token','authorization_code'],
    });
}

export function VitePluginWebId(options: WebIdOptions): Plugin {
    let serverDomain: string | null;

    return {
        name: 'vite-plugin-webid',
        configureServer(server) {
            server.watcher.on('ready', () => {
                serverDomain = server.resolvedUrls?.local?.[0] ?? null;
            });

            server.middlewares.use((req, res, next) => {
                if (!req.url?.endsWith('/webid.json')) {
                    next();

                    return;
                }

                const devOptions: WebIdOptions = {
                    ...options,
                    domain: serverDomain ?? options.domain,
                };

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/ld+json');
                res.write(generateWebId(devOptions), 'utf-8');
                res.end();
            });
        },
        generateBundle(_, bundle) {
            bundle['webid.json'] = {
                isAsset: true,
                type: 'asset',
                name: undefined,
                fileName: 'webid.json',
                source: generateWebId(options),
            };
        },
        resolveId(id) {
            if (id !== 'virtual:webid') {
                return;
            }

            return id;
        },
        load(id) {
            if (id !== 'virtual:webid') {
                return;
            }

            const domain = normalizeDomain(serverDomain ?? options.domain);
            const webId: WebId = {
                clientId: `${domain}webid.json`,
                clientName: options.name,
                redirectUrl: domain,
            };

            return `export default ${JSON.stringify(webId)};`;
        },
    };
}
