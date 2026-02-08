# Hedge

**ETH Oxford 2026 Hackathon**

An AI-powered hedging assistant that reads live on-chain price feeds from Flare's FTSO v2 oracle and recommends Polymarket positions to hedge your crypto exposure. Built with a retro pixel-art UI.

## How It Works

```
Flare FTSO v2 (on-chain)          Azure AI Agent
       |                                |
  getAllPrices()                   Analyzes prices +
  6 live feeds                    Polymarket data
       |                                |
       v                                v
  +------------------------------------------+
  |             Hedge App (Next.js)          |
  |                                          |
  |  Ticker: live FLR BTC ETH XRP SOL DOGE  |
  |  Market Card: agent-picked Polymarket    |
  |  Agent: mood, message, confidence        |
  |  Decision: BUY YES / BUY NO / SKIP      |
  +------------------------------------------+
```

1. **FTSO Price Feeds** - The `HedgePriceFeed` smart contract on Flare Coston2 reads FTSO v2 for 6 token prices (FLR, BTC, ETH, XRP, SOL, DOGE), polled every 5 seconds
2. **AI Agent** - An Azure-hosted AI agent analyzes the price data and Polymarket markets, then recommends a position to hedge against ETH
3. **User Decides** - The user sees the agent's recommendation with a confidence score and chooses to BUY YES, BUY NO, or SKIP
4. **Repeat** - After each decision the agent picks a new market and states the insights in 120 characters

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Blockchain | Solidity 0.8.25, Hardhat, ethers.js v6 |
| Oracle | Flare FTSO v2 (Coston2 testnet) |
| AI Agent | Azure Functions (Python), Azure AI Agent Service |
| Data | Polymarket CLOB API |

## Project Structure

```
ETH-Oxford-Hedge/
  contracts/               Solidity deployed smart contracts on Flare (Hardhat - optional)
    contracts/
      HedgePrice.sol        HedgePriceFeed - reads FTSO v2 for 6 price feeds
  Hedge-App/
    hedge-app/              Next.js frontend application
      src/app/
        api/agent/          API route proxying to Azure Function
        components/         Pixel-art UI components (widgets, screens, ui)
        config/             Flare contract config + ABI
        hooks/              useFlarePrice, useAgentAnalysis
  Hedge-Microservices/
    Hedge-Agent/
      Azure-Function/       Python Azure Function + AI Agent
        Agent/
          AzureAgent.py     Agent logic
          Prompts/          Prompt templates with FTSO/Polymarket placeholders
```

## Running Locally

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <repo-url>
cd ETH-Oxford-Hedge
```

```bash
cd Hedge-App/hedge-app
npm install
```

### 2. Set up environment variables

Create `Hedge-App/hedge-app/.env.local`:

```env
NEXT_PUBLIC_FLARE_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1a82fDF4d2603A84AA29389959a27878E293865B
AZURE_FUNCTION_URL=https://hedge-agent-e4g8hybrh3a0e9fm.uksouth-01.azurewebsites.net/api/hedge_create_message
```

### 3. Run the app

```bash
cd Hedge-App/hedge-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### What you should see

- **Ticker** scrolling live prices from FTSO v2 (FLR, BTC, ETH, XRP, SOL, DOGE)
- **Bottom bar** showing FTSO v2 connection status with green LIVE indicator and ETH price
- **Market Card** displaying the Polymarket position the agent recommends (or "No hedging opportunities" if no slug found)
- **Agent character** with mood-based pixel art, speech bubble with analysis, and confidence meter
- **Decision buttons** to act on the agent's recommendation

## Smart Contract

**HedgePriceFeed** - Deployed on Flare Coston2 Testnet

- **Address:** `0x1a82fDF4d2603A84AA29389959a27878E293865B`
- **Network:** Coston2 (Chain ID 114)
- **RPC:** `https://coston2-api.flare.network/ext/C/rpc`

Reads FTSO v2 price feeds via Flare's `ContractRegistry`:

| Index | Feed |
|-------|------|
| 0 | FLR/USD |
| 1 | BTC/USD |
| 2 | ETH/USD |
| 3 | XRP/USD |
| 4 | SOL/USD |
| 5 | DOGE/USD |

Key functions:
- `getAllPrices()` - Returns all 6 feeds in a single call (symbols, prices, decimals, timestamp)
- `getFeedPrice(index)` - Returns a single feed
- `checkAndSignal(index, signal)` - Emits on-chain price check + hedge signal events

### Compile contracts (optional)

```bash
cd contracts
npm install
npx hardhat compile
```

## AI Agent

The Azure-hosted AI agent:
- Receives live FTSO price data and Polymarket market data
- Analyzes the current market conditions
- Loops through list to find slugs and displays the best market to display to hedge ad
- Returns a JSON response:

```json
{
  "message": "ETH steady at 2093, hedge with...",
  "mood": "bullish",
  "confidence": 0.72,
  "slug_found": true,
  "market": {
    "question": "Will ETH hit $4,000 by March 2025?",
    "coin": "ETH",
    "yesPrice": 0.62
  }
}
```

## AI resources

Notebooklm on the papers that inspired the:
https://notebooklm.google.com/notebook/e87bd389-f596-461f-9c2f-5561d4ee834a?artifactId=8a1868b7-eed3-4af6-ab05-870b55d541b5

## Team

Built at ETH Oxford 2026.

Victory Mpokosa : 
- https://github.com/Victorymp
- https://www.linkedin.com/in/victory-mpokosa/

Yankho Mpokosa : 
- https://github.com/yankhono1
- https://www.linkedin.com/in/yankho-m/

## 🏆 Hackathon Notes

This project aims to win the following bounties at ETH Oxford 2026:

- Flare main track Use data protocols on Flare blockchain in an innovative and world changing way: FTSO (Flare Time Series Oracle) for price feeds.

## Flare feedback

- Connecting and deploying on the testnet was super intuitive and quick, the documentation was able to give you information about what FTSO is and also direct you to the correct resources at the correct time
- I enjoyed the workshop on the first day as it gave me a clear understanding of Flare as an effective oracle


## 🙏 Acknowledgments

- ETH Oxford Hackathon organizers
- Flare documentation and community
- Polymarket API providers and market makers
- OpenAI API
- Azure
- Hedge
