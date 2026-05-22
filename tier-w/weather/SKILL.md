---
name: weather
description: Get current weather and forecasts for any location — no API key required.
version: 1.8
---

> **Runtime:** Primary: `run /skills/weather/scripts/weather.js -l <location>`. Code mode: `require('/skills/weather/scripts/weather.js')` and call `console.log(await weather.getWeatherWttr(...))` or `console.log(await weather.getWeatherOpenMeteo(...))` — **`/code` only captures `console.log()` output.** Do NOT use `.then()`. Do NOT write fetch code manually.

## CLI Usage (primary)

These are terminal commands — use them as-is, not inside `code` fields.

```text
run /skills/weather/scripts/weather.js -l Boston
run /skills/weather/scripts/weather.js --location "San Francisco"
run /skills/weather/scripts/weather.js --provider open-meteo "Tokyo"
run /skills/weather/scripts/weather.js -l London -p wttr
```

**Short form:** `run scripts/weather.js -l Boston` also works from the skills directory.

In direct command mode, `weather.js` prints the result automatically.

Code mode is secondary — use it only when the AI needs to process weather data programmatically in a larger script. `handler` is exported from the module; it is not a global variable unless your runtime injects it.

---

## Code Mode (secondary)

**Important:** `/code` only captures `console.log()` output. Every example wraps the call in `console.log()`.

```js
const weather = require('/skills/weather/scripts/weather.js');

// wttr.in provider (default, human-readable)
console.log(await weather.getWeatherWttr('Boston'));
// → { provider: "wttr.in", location: "Boston, MA", tempC: "14", desc: "Sunny", ... }

// Open-Meteo provider (structured JSON, better for scripting)
console.log(await weather.getWeatherOpenMeteo('Tokyo'));
// → { provider: "open-meteo", location: "Tokyo, Japan", tempC: 12, weatherCode: 1, ... }

// Geocoding helper
console.log(await weather.geocodeOpenMeteo('London'));
// → { name: "London", country: "United Kingdom", latitude: 51.51, longitude: -0.11, timezone: "Europe/London" }
```

If you specifically want the event-style entry point:

```js
const weather = require('/skills/weather/scripts/weather.js');
console.log(await weather.handler({ location: "Boston" }));
```

For terminal-style parsing (`run /skills/...` equivalents in code), use `runFromParams`:

```js
const weather = require('/skills/weather/scripts/weather.js');
console.log(await weather.runFromParams({ location: "Boston" }));
console.log(await weather.runFromParams({ text: "London", provider: "open-meteo" }));
```

---

## wttr.in (default provider)

### Current conditions
```js
const res = await fetch('https://wttr.in/London?format=%l:+%c+%t+%h+%w&lang=en');
const text = await res.text();
// → "London: ⛅ +8°C 71% ↙5km/h"
```

### Full forecast with moon/travel info
```js
const res = await fetch('https://wttr.in/Tokyo?format=%l:+%c+%t+%h+%w&lang=en&T');
```

### Format codes
| Code | Meaning |
|------|---------|
| `%l` | Location name |
| `%c` | Weather condition icon |
| `%t` | Temperature |
| `%h` | Humidity % |
| `%w` | Wind |
| `%m` | Moon phase |

### Flags
| Flag | Effect |
|------|--------|
| `?0` | Current only |
| `?1` | Today only |
| `?m` | Metric units |
| `?u` | USCS units |
| `?T` | Full forecast with travel |

---

## Open-Meteo (structured JSON, programmatic)

Better for extraction — returns clean JSON with weather codes.

### Current weather by coordinates
```js
const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current_weather=true';
const res = await fetch(url);
const json = await res.json();
// json.current_weather → { temperature: 8, windspeed: 5, weathercode: 3, time: "2024-..." }
```

### Geocoding + forecast
```js
// 1. Get coordinates
const geo = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=Boston&count=1&language=en&format=json`)).json();
// geo.results[0] → { latitude: 42.36, longitude: -71.06, name: "Boston" }

// 2. Use coordinates for forecast
const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.results[0].latitude}&longitude=${geo.results[0].longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
```

### WMO weather codes
| Code | Meaning |
|------|---------|
| 0 | Clear sky |
| 1-3 | Partly cloudy |
| 45/48 | Fog |
| 51-55 | Drizzle |
| 61-65 | Rain |
| 71-77 | Snow |
| 80-82 | Rain showers |
| 95-99 | Thunderstorm |

---

## Skill Metadata

- **Always active**: no trigger needed, respond whenever user asks weather
- **Platform**: iOS (JavaScriptCore runtime)
- **No API key required** for either service
- **Notes**: wttr.in is human-readable; Open-Meteo is better for scripting

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/weather.js -l Boston
```
