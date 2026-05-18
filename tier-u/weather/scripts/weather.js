// Lightweight weather helpers for the iPhone JS sandbox
// Providers: wttr.in (no key), Open-Meteo (no key)

async function getWeatherWttr(location) {
  const loc = encodeURIComponent(location || '');
  const url = `https://wttr.in/${loc}?format=j1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' }, timeout: 10 });
  if (!res.ok) throw new Error(`wttr.in error: ${res.status}`);
  let json;
  try {
    json = await res.json();
  } catch (e) {
    // wttr.in returned non-JSON (bot detection / HTML page). Fall back to Open-Meteo.
    const raw = typeof res.text === 'function' ? await res.text().catch(() => '') : '';
    console.warn(`wttr.in returned non-JSON for "${location}", falling back to Open-Meteo. Preview: ${String(raw).slice(0, 120)}`);
    return await getWeatherOpenMeteo(location);
  }
  const current = json?.current_condition?.[0];
  return {
    provider: 'wttr.in',
    location: json?.nearest_area?.[0]?.areaName?.[0]?.value || location,
    tempC: current?.temp_C,
    tempF: current?.temp_F,
    feelsLikeC: current?.FeelsLikeC,
    feelsLikeF: current?.FeelsLikeF,
    windKph: current?.windspeedKmph,
    humidity: current?.humidity,
    desc: current?.weatherDesc?.[0]?.value,
  };
}

async function geocodeOpenMeteo(location) {
  const loc = encodeURIComponent(location || '');
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${loc}&count=1&language=en&format=json`;
  const res = await fetch(url, { timeout: 10 });
  if (!res.ok) throw new Error(`Open-Meteo geocode error: ${res.status}`);
  const json = await res.json();
  const hit = json?.results?.[0];
  if (!hit) throw new Error(`No geocode results for: ${location}`);
  return {
    name: hit.name,
    country: hit.country,
    latitude: hit.latitude,
    longitude: hit.longitude,
    timezone: hit.timezone,
  };
}

async function getWeatherOpenMeteo(location) {
  const geo = await geocodeOpenMeteo(location);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code&timezone=${encodeURIComponent(geo.timezone)}`;
  const res = await fetch(url, { timeout: 10 });
  if (!res.ok) throw new Error(`Open-Meteo forecast error: ${res.status}`);
  const json = await res.json();
  const current = json?.current || {};
  return {
    provider: 'open-meteo',
    location: `${geo.name}, ${geo.country}`,
    tempC: current.temperature_2m,
    feelsLikeC: current.apparent_temperature,
    windKph: current.wind_speed_10m,
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
  };
}

const weatherApi = {
  getWeatherWttr,
  getWeatherOpenMeteo,
};

// --- Simple CLI-style command parsing ---
// Supports quoted args and flags like: --provider open-meteo, -p wttr
// Examples:
//   "weather Boston"
//   "weather --provider open-meteo 'San Francisco'"
//   "--provider wttr Seattle"
function tokenize(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return [];
  const tokens = [];
  let i = 0, cur = '', inQuotes = false, quoteChar = '';
  while (i < cmd.length) {
    const ch = cmd[i];
    if (inQuotes) {
      if (ch === quoteChar) { inQuotes = false; quoteChar = ''; tokens.push(cur); cur = ''; }
      else { cur += ch; }
    } else {
      if (ch === '"' || ch === "'") { inQuotes = true; quoteChar = ch; if (cur) { tokens.push(cur); cur = ''; } }
      else if (/\s/.test(ch)) { if (cur) { tokens.push(cur); cur = ''; } }
      else { cur += ch; }
    }
    i += 1;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseWeatherCommand(cmd) {
  const tokens = tokenize(cmd);
  const out = { provider: undefined, location: undefined };
  if (tokens.length === 0) return out;

  // Drop leading wrapper/name for forms like: 'run weather.js ...'
  const startsWithRun = tokens[0].toLowerCase() === 'run';
  if (startsWithRun) tokens.shift();
  if (startsWithRun && tokens[0] && !tokens[0].startsWith('-')) tokens.shift();

  // Flags parsing
  let i = 0;
  const locationParts = [];
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '--provider' || t === '-p' || t === '-P') {
      if (i + 1 < tokens.length) { out.provider = tokens[i + 1]; i += 2; continue; }
    }
    if (t === '--location' || t === '-l' || t === '-L') {
      if (i + 1 < tokens.length) {
        locationParts.push(tokens[i + 1]);
        i += 2;
        continue;
      }
    }
    if (t.startsWith('-')) {
      i += 1;
      continue;
    }
    locationParts.push(t);
    i += 1;
  }

  // Parsed location from flags and/or positionals
  if (locationParts.length) {
    out.location = locationParts.join(' ');
  }

  // Also handle shorthand provider-first forms like: "wttr Boston" or "open-meteo SF"
  if (!out.provider && out.location) {
    const firstWord = out.location.split(/\s+/)[0].toLowerCase();
    if (firstWord === 'wttr' || firstWord === 'open-meteo' || firstWord === 'open_meteo' || firstWord === 'open') {
      out.provider = firstWord;
      out.location = out.location.split(/\s+/).slice(1).join(' ');
    }
  }

  return out;
}

// Convenience runner for environments that inject parameters (e.g. iPhone `executeJavaScript`).
// Reads `PARAMS` (object) or `PARAMS_JSON` (string) if available and returns a provider result.
async function runFromParams(inputParams) {
  var params = inputParams || {};
  if (!inputParams) {
    try {
      if (typeof PARAMS !== 'undefined' && PARAMS !== null) { params = PARAMS; }
      else if (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON) { params = JSON.parse(PARAMS_JSON); }
    } catch (e) { params = {}; }
  }

  // Resolve location: direct field → parsed command string → argv
  let location = params.location || params.loc || params.query || '';
  let provider = (params.provider || '').toLowerCase();

  if (!location && params.command) {
    const parsed = parseWeatherCommand(params.command);
    if (parsed.provider) provider = parsed.provider.toLowerCase();
    if (parsed.location) location = parsed.location;
  }
  if (!location && params.argv && params.argv.length) {
    const parsed = parseWeatherCommand(params.argv.join(' '));
    if (parsed.provider) provider = parsed.provider.toLowerCase();
    if (parsed.location) location = parsed.location;
  }

  if (provider.includes('open') || provider === 'open-meteo' || provider === 'open_meteo') {
    return await getWeatherOpenMeteo(location);
  }
  return await getWeatherWttr(location);
}

weatherApi.runFromParams = runFromParams;
weatherApi.parseWeatherCommand = parseWeatherCommand;

async function runFromCli(argv) {
  const parsed = parseWeatherCommand(argv.join(' '));
  const provider = (parsed.provider || '').toLowerCase();
  const location = parsed.location || '';

  if (provider.includes('open') || provider === 'open-meteo' || provider === 'open_meteo') {
    return await getWeatherOpenMeteo(location);
  }
  return await getWeatherWttr(location);
}

weatherApi.runFromCli = runFromCli;

async function handler(event, context) {
  var params = (event && event.parameters) || {};
  // Fallback: if called with no parameters but PARAMS was injected by Swift
  if (typeof PARAMS !== 'undefined' && PARAMS && Object.keys(params).length === 0) {
    params = PARAMS;
  }
  return await runFromParams(params);
}

function init() {
  return { status: 'ok' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...weatherApi, handler, init, runFromParams, parseWeatherCommand };
}
if (typeof globalThis !== 'undefined') {
  globalThis.weatherApi = weatherApi;
}

if (typeof process !== 'undefined' && typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runFromCli(process.argv.slice(2))
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error?.message || String(error));
      process.exitCode = 1;
    });
}

// Only auto-run from PARAMS when this file is executed directly (not when require()'d).
// When loaded via require(), the module IIFE wrapper defines a local `module` variable, so
// `typeof module !== 'undefined'` is true and we skip this block to avoid running twice.
if (typeof module === 'undefined' && ((typeof PARAMS !== 'undefined' && PARAMS !== null) || (typeof PARAMS_JSON !== 'undefined' && PARAMS_JSON))) {
  return (async function() {
    var result = await runFromParams();
    if (typeof console !== 'undefined' && console.log) {
      if (typeof result === 'string') { console.log(result); }
      else { console.log(JSON.stringify(result, null, 2)); }
    }
    return result;
  })().catch(function(err) {
    if (typeof console !== 'undefined' && console.error) console.error(err && err.message ? err.message : String(err));
    throw err;
  });
}
