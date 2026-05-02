/**
 * Simple HTTP Skill adapted for Whistant JSC (JavaScriptCore)
 * Replaces Node.js http/https modules with fetch()
 * No Buffer, no require(), no module.exports
 */

var SIMPLEHTTP_DEFAULTS = {
    maxRetries: 3,
    timeout: 30000,
    backoffBase: 500,
    backoffMax: 30000
};

var SIMPLEHTTP_RETRYABLE = [429, 500, 502, 503, 504];

function simplehttp_backoff(attempt, base, max) {
    var delay = Math.min(base * Math.pow(2, attempt), max);
    return delay * (0.5 + Math.random() * 0.5);
}

function simplehttp_sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

function SimpleHttpClient(options) {
    options = options || {};
    this.defaultHeaders = options.defaultHeaders || {};
    this.maxRetries = options.maxRetries != null ? options.maxRetries : SIMPLEHTTP_DEFAULTS.maxRetries;
    this.timeout = options.timeout != null ? options.timeout : SIMPLEHTTP_DEFAULTS.timeout;
    this.backoffBase = options.backoffBase != null ? options.backoffBase : SIMPLEHTTP_DEFAULTS.backoffBase;
    this.backoffMax = options.backoffMax != null ? options.backoffMax : SIMPLEHTTP_DEFAULTS.backoffMax;
}

SimpleHttpClient.prototype._buildFetchOptions = function(method, url, options) {
    options = options || {};
    var headers = {};
    // Merge default headers
    var keys = Object.keys(this.defaultHeaders);
    for (var i = 0; i < keys.length; i++) {
        headers[keys[i].toLowerCase()] = this.defaultHeaders[keys[i]];
    }
    // Merge per-request headers
    if (options.headers) {
        var hkeys = Object.keys(options.headers);
        for (var j = 0; j < hkeys.length; j++) {
            headers[hkeys[j].toLowerCase()] = options.headers[hkeys[j]];
        }
    }

    var fetchOpts = {
        method: method.toUpperCase(),
        headers: headers
    };

    if (options.body != null) {
        if (typeof options.body === "object") {
            fetchOpts.body = JSON.stringify(options.body);
            if (!headers["content-type"]) {
                headers["content-type"] = "application/json";
            }
        } else {
            fetchOpts.body = String(options.body);
        }
    }

    return fetchOpts;
};

SimpleHttpClient.prototype._doFetch = async function(url, fetchOptions) {
    try {
        var res = await fetch(url, fetchOptions);
        var contentType = res.headers.get("content-type") || "";
        var isJson = contentType.indexOf("json") !== -1;
        var body;
        try {
            body = isJson ? await res.json() : await res.text();
        } catch(e) {
            body = await res.text();
        }
        
        // Build headers object
        var respHeaders = {};
        res.headers.forEach(function(v, k) {
            respHeaders[k] = v;
        });

        return {
            ok: res.status >= 200 && res.status < 300,
            status: res.status,
            headers: respHeaders,
            body: body,
            error: null
        };
    } catch(err) {
        return {
            ok: false,
            status: null,
            headers: {},
            body: null,
            error: err.message || String(err)
        };
    }
};

SimpleHttpClient.prototype.request = async function(method, url, options) {
    method = method.toUpperCase();
    var maxRetries = (options && options.maxRetries != null) ? options.maxRetries : this.maxRetries;
    var fetchOpts = this._buildFetchOptions(method, url, options);
    var lastResult = null;

    for (var attempt = 0; attempt <= maxRetries; attempt++) {
        lastResult = await this._doFetch(url, fetchOpts);
        
        var shouldRetry = lastResult.status === null || SIMPLEHTTP_RETRYABLE.indexOf(lastResult.status) !== -1;
        
        if (!shouldRetry || attempt === maxRetries) {
            return lastResult;
        }

        await simplehttp_sleep(simplehttp_backoff(attempt, this.backoffBase, this.backoffMax));
    }

    return lastResult;
};

// Convenience methods
SimpleHttpClient.prototype.get = function(url, options) { return this.request("GET", url, options); };
SimpleHttpClient.prototype.post = function(url, options) { return this.request("POST", url, options); };
SimpleHttpClient.prototype.put = function(url, options) { return this.request("PUT", url, options); };
SimpleHttpClient.prototype.patch = function(url, options) { return this.request("PATCH", url, options); };
SimpleHttpClient.prototype.delete = function(url, options) { return this.request("DELETE", url, options); };
SimpleHttpClient.prototype.head = function(url, options) { return this.request("HEAD", url, options); };
SimpleHttpClient.prototype.options = function(url, options) { return this.request("OPTIONS", url, options); };
