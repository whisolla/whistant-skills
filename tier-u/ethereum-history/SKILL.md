---
name: ethereum-history
description: Read-only factual data about historical Ethereum mainnet contracts via ethereumhistory.com REST API. Lookup a contract by address (getContract), discover contracts by era or time range (discoverContracts), or fetch the API manifest. Use when the user asks about a specific contract address, early Ethereum contracts, deployment era, deployer, bytecode, or documented history. No API key required. Renamed from cartoonitunes/ethereum-history.
version: 1.1
---

> **Runtime — `/cmd` preferred:** `run /skills/ethereum-history/scripts/ethereum-history.js [--address ADDR] [--action discover]`. The `/cmd` terminal path is the first choice. `/code` (require) is available as a secondary path. All endpoints are GET-only, no authentication required.

# Ethereum History

Read-only, factual data about historical Ethereum mainnet contracts.

# How to Call

> **`/cmd` first (preferred), `/code` second.**

### /cmd — Terminal

```sh
# Discover contracts (default: featured, 10 results)
run /skills/ethereum-history/scripts/ethereum-history.js

# Look up a specific contract by address
run /skills/ethereum-history/scripts/ethereum-history.js --address 0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb

# Discover with filters
run /skills/ethereum-history/scripts/ethereum-history.js --action discover --era frontier --limit 10
run /skills/ethereum-history/scripts/ethereum-history.js --action discover --featured --limit 20
```

### /code — JavaScript (require)

```js
var s = require('/skills/ethereum-history/scripts/ethereum-history.js');
var list = await s.discoverContracts({ featured: true, limit: 5 });
console.log(s.formatContractList(list));
var result = await s.getContract('0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb');
console.log(s.formatContract(result.data));
```

## Endpoints

### 1. Contract facts — `getContract(address)`

Returns full factual data for one contract: address, era, deployer, deployment block/timestamp, runtime bytecode, decompiled code, short description, historical summary, heuristics, links, metadata.

### 2. Discovery — `discoverContracts(opts)`

Query params (all optional):
- `era_id` — Filter by era (`frontier`, `homestead`, `dao`, `tangerine`, `spurious`)
- `featured` — `true` for featured contracts only
- `undocumented_only` — `true` for undocumented contracts
- `from_timestamp` / `to_timestamp` — ISO 8601 time range
- `limit` — 1–200, default 50
- `offset` — Pagination offset

### 3. Manifest — `getManifest()`

Returns the API manifest with capabilities, endpoints, and terms.

## Output

Formatting functions produce readable markdown tables:
- `formatContract(data)` — single contract as markdown table with sections
- `formatContractList(result)` — discovery results as compact markdown table

## Notes

- All data is **read-only and factual**. No opinions or editorial stance.
- Base URL: `https://ethereumhistory.com`
- No authentication required. All endpoints are GET-only.
- Contract history facts are only available for contracts documented on EthereumHistory.com.

## Local Testing

Parent project uses ESM; scripts use CommonJS (required for JSC `return`). Override once:

```bash
echo '{"type":"commonjs"}' > scripts/package.json
node scripts/ethereum-history.js --address 0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb
```
