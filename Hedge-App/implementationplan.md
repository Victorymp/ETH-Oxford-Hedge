# Implementation Plan: FTSO v2 Price Feed + AI Agent for Hedge App

## Overview

Add two features to the Hedge App:
1. **Live price feeds** from the deployed `HedgePriceFeed` contract on Coston2 (reads FTSO v2)
2. **AI-powered agent** via Azure Function calling Azure AI Agent for trading recommendations

## Data Flow

```
[HedgePriceFeed Contract on Coston2]
        |
        | ethers.js calls getAllPrices()
        | (6 feeds: FLR, BTC, ETH, XRP, SOL, DOGE)
        |
        v
[useFlarePrice hook] --> allPrices, ethPrice, trend
        |
        +--> [Ticker] shows all live prices
        +--> [Bottom Bar] shows connection status + ETH price
        |
        +--> [useEffect on market change]
                |
                +--> POST /api/agent (with FTSO price data)
                        |
                        +--> Proxies to Azure Function
                        |    GET /api/hedge_create_message
                        |
                        +--> Azure AI Agent --> { message, mood, confidence }
                                |
                                +--> [AgentCharacter] mood frame
                                +--> [TypeWriter] speech bubble message
                                +--> [Confidence Meter] AI confidence
```

---

## Deployed Infrastructure

| Component | Details |
|-----------|---------|
| **Smart Contract** | `HedgePriceFeed` at `0x1a82fDF4d2603A84AA29389959a27878E293865B` |
| **Network** | Flare Coston2 Testnet (Chain ID 114) |
| **RPC** | `https://coston2-api.flare.network/ext/C/rpc` |
| **Azure Function** | `/api/hedge_create_message` → runs Azure AI Agent |
| **Agent Response** | `{ output: "{ message, mood, confidence }" }` |

### Contract Feed Indices
| Index | Symbol |
|-------|--------|
| 0 | FLR/USD |
| 1 | BTC/USD |
| 2 | ETH/USD |
| 3 | XRP/USD |
| 4 | SOL/USD |
| 5 | DOGE/USD |

---

## Phase 1: Infrastructure

### 1.1 Install Dependencies
```bash
npm install ethers
```
No `openai` package needed — agent calls go through Azure Function.

### 1.2 Update `.env.local`
**File:** `hedge-app/.env.local` (already has Flare vars, add Azure Function URL)
```env
NEXT_PUBLIC_FLARE_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1a82fDF4d2603A84AA29389959a27878E293865B
AZURE_FUNCTION_URL=http://localhost:7071
```

### 1.3 Populate Flare Config
**Modify:** `src/app/config/flare.js` (file exists but is empty)

Contains:
- RPC URL + contract address from env vars
- Minimal ABI from compiled artifacts (only `getAllPrices`, `getFeedPrice`, `getFeedCount`)
- Feed index constants (ETH_INDEX=2, BTC_INDEX=1, etc.)
- Poll interval constant (5 seconds)

---

## Phase 2: FTSO Price Feed (Feature 1)

### 2.1 Create `useFlarePrice` Hook
**New file:** `src/app/hooks/useFlarePrice.js` (needs `"use client"`)

- Initializes `ethers.JsonRpcProvider` + `Contract` via refs
- Calls `getAllPrices()` every 5 seconds to get all 6 feeds at once
- Parses raw values: `price / 10^abs(decimals)` for human-readable prices
- Maintains rolling ETH price history (last 20 readings) for trend analysis
- Returns:
  ```js
  {
    allPrices,     // { "ETH/USD": 2650.42, "BTC/USD": 65000, ... }
    ethPrice,      // number | null
    priceHistory,  // [{ price, timestamp }, ...]
    trend,         // positive = up, negative = down
    changePercent, // % change over history window
    loading,       // boolean
    error,         // string | null
    lastUpdated,   // Date | null
  }
  ```

### 2.2 Wire into HedgeWidget
**Modify:** `src/app/components/HedgeWidget.jsx`

- Import `useFlarePrice`
- Update `tickerText` to show all live prices from `allPrices`
- Update bottom bar to show real connection status (green/yellow/red dot)

---

## Phase 3: AI Agent (Feature 2)

### 3.1 Create API Route
**New file:** `src/app/api/agent/route.js`

- POST endpoint receiving `{ ftsoData }` from the frontend
- Proxies to Azure Function: `GET ${AZURE_FUNCTION_URL}/api/hedge_create_message`
- Parses the Azure response `{ output: "{ message, mood, confidence }" }`
- Extracts and validates the JSON from `output` string
- Returns clean `{ message, mood, confidence }` to the frontend
- Graceful fallback on any error

### 3.2 Populate `useAgentAnalysis` Hook
**Modify:** `src/app/hooks/useAgentAnalysis.js` (currently empty, needs `"use client"`)

- `analyze()` function: sets mood to "thinking", calls `/api/agent`, processes response
- Maps AI mood to character mood: bullish → `"happy"`, bearish/neutral → `"idle"`
- Returns:
  ```js
  {
    agentMessage,  // string
    agentMood,     // "idle" | "thinking" | "happy"
    confidence,    // number 0-1
    isAnalyzing,   // boolean
    error,         // string | null
    analyze,       // ({ ftsoData }) => Promise
  }
  ```
- Fallback messages on API failure

### 3.3 Wire into HedgeWidget
**Modify:** `src/app/components/HedgeWidget.jsx`

- Import `useAgentAnalysis`
- Remove hardcoded `AGENT_MESSAGES` constant
- Remove manual `agentMood`/`agentMessage` state (now in hook)
- Replace agent `useEffect` to call `analyze()` on market change (gated on price being available)
- Use ref for prices to avoid triggering analysis on every price update
- Pass `confidence` to MainScreen

### 3.4 Update MainScreen
**Modify:** `src/app/components/screens/MainScreen.jsx`

- Accept new `confidence` prop
- Use `confidence * 100` for confidence meter width instead of `market.yesPrice * 100`

---

## Files Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/app/hooks/useFlarePrice.js` | Hook polling HedgePriceFeed contract for all prices |
| `src/app/api/agent/route.js` | API route proxying to Azure Function |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/app/config/flare.js` | Populate with contract ABI, address, feed indices |
| `src/app/hooks/useAgentAnalysis.js` | Populate with agent analysis hook |
| `src/app/components/HedgeWidget.jsx` | Import hooks, replace hardcoded agent logic, update ticker + bottom bar |
| `src/app/components/screens/MainScreen.jsx` | Use `confidence` prop for confidence meter |

### Env Changes
| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_FLARE_RPC_URL` | Already set |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Already set |
| `AZURE_FUNCTION_URL` | **Needs adding** |

### Unchanged Files
All other components (Ticker, AgentCharacter, MarketCard, DecisionButtons, Navigation, TypeWriter, PixelGrid, CoinPixel, PriceBar, PortfolioScreen, HistoryScreen) need NO changes.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| FTSO initial load | Ticker shows "loading...", bottom bar yellow dot |
| RPC / contract call failure | Red dot, last known prices retained, retries on next poll |
| Azure Function unreachable | Fallback message shown, mood = idle, confidence = 0.5 |
| Agent returns non-JSON | Parse error caught, fallback message |
| No price data yet | Agent analysis deferred until first price arrives |

## Key Design Decisions

- **`getAllPrices()`** single call gets all 6 feeds — efficient, one RPC call per poll
- **Agent triggers on market change only** (not every price update) to avoid excessive Azure calls
- **Next.js API route proxies** Azure Function — keeps the URL server-side, handles response parsing
- **5-second poll interval** balances freshness vs RPC rate limits
- **Contract ABI** extracted from compiled Hardhat artifacts (only view functions needed)

## Note: Azure Function Enhancement

The Azure Function's `build_prompt()` method supports injecting FTSO data via `{%FTSO_data%}` and `{%polymarket_data%}` placeholders, but `query_agent()` doesn't call it yet. When ready, the `/api/agent` route can POST FTSO data to the Azure Function for richer agent context.

## Verification
1. Run `npm run dev` and check browser console for contract price logs
2. Verify ticker shows all 6 live prices from FTSO
3. Verify bottom bar shows green "LIVE" dot when connected to Coston2
4. Switch markets and verify agent shows "analyzing FTSO feeds..." then AI message appears
5. Test error states: wrong contract address → verify fallback behavior
