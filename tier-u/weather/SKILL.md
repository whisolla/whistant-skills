---
name: weather
description: Get current weather and forecasts for any location — no API key required.
version: 1.1
---

> **Runtime:** Use `handler()` from `scripts/weather.js` — fetches weather via `wttr.in` or `Open-Meteo` using `fetch()`. Do NOT use iOS Shortcuts or runShortcut.

## wttr.in (quick, primary)

### Current conditions — one location
```js
// London
const res = await fetch('https://wttr.in/London?format=%l:+%c+%t+%h+%w&lang=en');
const text = await res.text();
// → "London: ⛅ +8°C 71% ↙5km/h"
```

### Current conditions — URL-encoded city
```js
// New York (encode spaces with +)
const res = await fetch('https://wttr.in/New+York?format=3');
const text = await res.text();
// → "New York: ⛅️ +12°C"
```

### Full forecast with moon/travel info
```js
const res = await fetch('https://wttr.in/Tokyo?format=%l:+%c+%t+%h+%w&lang=en&T');
// The ?T flag gives a 3-day forecast with moon phase and travel info
```

### Save as PNG image
```js
// Note: use browserPerformAction screenshot instead for in-app capture
// wttr.in PNG endpoint:
const res = await fetch('https://wttr.in/Berlin.png?format=2');
const buf = await res.arrayBuffer();
// Save via fs: require('fs').writeFileSync('weather.png', Buffer.from(buf))
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

### Get current weather by coordinates
```js
// London coordinates
const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current_weather=true';
const res = await fetch(url);
const json = await res.json();
const cw = json.current_weather;
// → { temperature: 8, windspeed: 5, weathercode: 3, time: "2024-..." }
```

### Get coordinates for a city name
```js
// Geocoding
const name = 'Boston';
const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
const json = await res.json();
const loc = json.results[0];
// → { latitude: 42.36, longitude: -71.06, name: "Boston" }
// Then use loc.latitude + loc.longitude in the forecast URL
```

### Full 7-day forecast
```js
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
const res = await fetch(url);
const json = await res.json();
// json.daily has arrays of 7 days
```

### WMO weather code reference
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
