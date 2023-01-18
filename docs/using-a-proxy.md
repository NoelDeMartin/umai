# Using a Proxy

As mentioned in the app, making requests to other domains is going to fail with a [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) error most of the time. Given that this application does not have a server component (it's running completely in the frontend), the only solution is to rely on an external service to work around that.

And that's what the proxy url you can configure in the app is for. The app sends a request to a proxy server with the website url you want to parse, and gets back a response with the page HTML. The proxy url is expected to respond to a `POST` request with a payload containing a `url` field, and return the page HTML in the body.

The proxy that comes configured with the app by default uses [noeldemartin/proxy](https://github.com/NoelDeMartin/proxy), so you're welcome to host that yourself. It doesn't track any ips nor personal information, so your requests should be anonymous anyways. But at the moment it's limited to 100 requests every 10 minutes (in total, not per user).

Eventually, it may be better to use a proper [HTTP proxy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling#http_tunneling). But I don't have a lot of experience working with proxies, and I didn't want to spend any more time working on this (I prefer to focus on UX and features). If you are interested in helping out with this, please [let me know](https://github.com/NoelDeMartin/umai/issues).
