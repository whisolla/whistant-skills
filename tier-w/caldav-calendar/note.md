v2.6 — QA fix (2026-05-22)

Changes:
- discover() now returns parsed {baseUrl, principalUrl, calendarHome} — not raw XML
- Added 2-step iCloud discovery (root→principal) in discover()
- Added fullSync action — discover→list→query in one /cmd
- listCalendars now returns absolute URLs via resolveHref()
- Added _propfind helper, parseHrefIn, resolveHref utilities
- SKILL.md: /cmd-only — removed /code section to prevent AI from defaulting to JS code
- Result: agent uses `run /skills/caldav-calendar/scripts/caldav-calendar.js fullSync` via /cmd

Demo flow: 1 readFile → 1 /cmd fullSync → clean AI response
