function fetchWithRetrySleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function fetchWithRetry(url, options, maxRetries) {
  options = options || {};
  maxRetries = maxRetries == null ? 3 : maxRetries;
  var retryDelay = options.retryDelay || 1000;
  var timeout = options.timeout || 30000;

  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeoutId = controller ? setTimeout(function() { controller.abort(); }, timeout) : null;
      var fetchOptions = {};
      var keys = Object.keys(options);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k !== 'retryDelay' && k !== 'timeout') fetchOptions[k] = options[k];
      }
      if (controller) fetchOptions.signal = controller.signal;
      var response = await fetch(url, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);
      if (response.status === 429 || response.status >= 500) {
        if (attempt === maxRetries) return response;
        await fetchWithRetrySleep(retryDelay * Math.pow(2, attempt));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await fetchWithRetrySleep(retryDelay * Math.pow(2, attempt));
    }
  }
}

(async function() {
  try {
    var res = await fetchWithRetry('https://httpbin.org/get', { timeout: 5000 }, 1);
    var data = await res.json();
    console.log(JSON.stringify({ ok: res.ok, status: res.status, url: data.url }));
  } catch (e) {
    console.log(JSON.stringify({ ok: false, error: String(e.message || e) }));
  }
})();
