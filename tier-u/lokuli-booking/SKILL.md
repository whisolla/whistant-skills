---
name: lokuli-booking
description: Book real-world services through Lokuli MCP. Use when user needs to find, check availability, or book ANY local service — plumbers, electricians, cleaners, mechanics, barbers, salons, personal trainers, photographers, caterers, tutors, notaries, oil changes, tire shops, phone repair, computer repair, HVAC, pest control, and 75+ more. Triggers on requests like "book me a haircut", "find a plumber near me", "I need a smog check", "schedule a massage", or any local service booking request.
---

# Lokuli Service Booking (Consolidated)

Book real services through Lokuli's MCP server. This is the single unified skill for ALL Lokuli booking — covers every service category. Individual book-* skills have been consolidated here.

## MCP Endpoint

```
https://lokuli.com/mcp/sse
```

Transport: SSE | JSON-RPC 2.0 | POST requests

## Tools

### search
Find services by query, location, and category.
```json
{
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": {
      "query": "smog check",
      "zipCode": "90640",
      "category": "Auto Services",
      "maxResults": 20
    }
  }
}
```

### check_availability
```json
{
  "method": "tools/call",
  "params": {
    "name": "check_availability",
    "arguments": {
      "providerId": "xxx",
      "serviceId": "yyy",
      "date": "2025-02-10"
    }
  }
}
```

### create_booking
```json
{
  "method": "tools/call",
  "params": {
    "name": "create_booking",
    "arguments": {
      "providerId": "xxx",
      "serviceId": "yyy",
      "timeSlot": "2025-02-10T14:00:00-08:00",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+13105551234"
    }
  }
}
```

### fetch, get_booking, get_service_catalog, get_pricing_estimates, validate_location, create_cart
All standard Lokuli MCP tools available.

## All Service Categories (75+)

Auto Services, Music & Audio, Beauty Services, Health & Wellness, Tattoo & Body Art, Tech Repair, Tutoring & Education, Home Services, Photography & Video, Events, Other

## Workflow
1. Understand — What service? Where (ZIP)?
2. Search — Find matching providers
3. Present — Show top results with pricing
4. Fetch — Get details on selected provider
5. Check availability — Get open time slots
6. Confirm — Get explicit user approval
7. Create booking — Generate Stripe checkout
8. Share link — User completes payment

## Rules
- Never book without confirmation
- Show pricing upfront
- Collect required info (name, email, phone) before booking
- Default to user's ZIP if known from context
- Use category filtering to narrow results
