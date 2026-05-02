var toolCallRetryCache = new Map();

function toolCallRetrySleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function toolCallRetry(params) {
  params = params || {};
  var toolFn = params.toolFn;
  var args = params.args || {};
  var maxRetries = Math.max(1, Math.min(10, params.maxRetries || 3));
  var initialDelayMs = Math.max(100, Math.min(10000, params.initialDelayMs || 1000));
  var validatorFn = typeof params.validatorFn === 'function' ? params.validatorFn : function() { return true; };
  var errorHandlerFn = typeof params.errorHandlerFn === 'function' ? params.errorHandlerFn : null;
  var idempotencyKey = params.idempotencyKey;

  if (typeof toolFn !== 'function') {
    return { success: false, data: null, attempts: 0, fromCache: false, error: 'toolFn must be a function' };
  }

  if (idempotencyKey && toolCallRetryCache.has(idempotencyKey)) {
    return { success: true, data: toolCallRetryCache.get(idempotencyKey), attempts: 0, fromCache: true, error: null };
  }

  var lastError = null;
  for (var attempt = 0; attempt < maxRetries; attempt++) {
    try {
      var result = await toolFn(args);
      if (validatorFn(result)) {
        if (idempotencyKey) toolCallRetryCache.set(idempotencyKey, result);
        return { success: true, data: result, attempts: attempt + 1, fromCache: false, error: null };
      }
      throw new Error('Result validation failed');
    } catch (error) {
      lastError = error;
      if (errorHandlerFn) {
        try {
          var fixed = await errorHandlerFn(error, attempt);
          if (fixed && fixed.args && typeof fixed.args === 'object') {
            var keys = Object.keys(fixed.args);
            for (var i = 0; i < keys.length; i++) args[keys[i]] = fixed.args[keys[i]];
          } else if (fixed && fixed.abort) {
            break;
          }
        } catch (handlerError) {}
      }
      if (attempt === maxRetries - 1) break;
      await toolCallRetrySleep(initialDelayMs * Math.pow(2, attempt));
    }
  }

  return { success: false, data: null, attempts: maxRetries, fromCache: false, error: lastError ? String(lastError.message || lastError) : 'Unknown error' };
}

(async function(){
  var count = 0;
  var result = await toolCallRetry({
    toolFn: async function(args) {
      count += 1;
      if (count < 2) throw new Error('flaky');
      return { ok: true, city: args.city };
    },
    args: { city: 'Boston' },
    maxRetries: 3,
    validatorFn: function(res) { return !!(res && res.ok); },
    idempotencyKey: 'demo-retry'
  });
  console.log(JSON.stringify(result));
})();
