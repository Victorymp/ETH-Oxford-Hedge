"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "./widgets/Navigation";
import Ticker from "./widgets/Ticker";
import MainScreen from "./screens/MainScreen";
import PortfolioScreen from "./screens/PortfolioScreen";
import HistoryScreen from "./screens/HistoryScreen";
import useFlarePrice from "../hooks/useFlarePrice";
import useAgentAnalysis from "../hooks/useAgentAnalysis";

// Simulated market data (prediction market questions)
const MARKETS = [
  { id: 1, coin: "ETH", question: "ETH will hit $4k by March?", yesPrice: 0.62, change: +5.2, sentiment: "bullish" },
  { id: 2, coin: "BTC", question: "BTC dominance > 55% in Feb?", yesPrice: 0.78, change: -2.1, sentiment: "bearish" },
  { id: 3, coin: "FLR", question: "FLR TVL doubles by Q2?", yesPrice: 0.34, change: +12.7, sentiment: "bullish" },
  { id: 4, coin: "ETH", question: "ETH staking yield > 5%?", yesPrice: 0.45, change: +1.8, sentiment: "neutral" },
  { id: 5, coin: "BTC", question: "BTC ETF inflows > $1B Feb?", yesPrice: 0.81, change: +0.4, sentiment: "bullish" },
];

export default function HedgeWidget() {
  const [currentMarket, setCurrentMarket] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [decisions, setDecisions] = useState([]);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [time, setTime] = useState(new Date());
  const [portfolio, setPortfolio] = useState({ balance: 1000, positions: [] });
  const [screen, setScreen] = useState("main");
  const [bounce, setBounce] = useState(false);
  const [flashColor, setFlashColor] = useState(null);

  // FTSO price feed from HedgePriceFeed contract
  const {
    allPrices,
    ethPrice,
    loading: priceLoading,
    error: priceError,
  } = useFlarePrice();

  // AI agent analysis via Azure Function
  const {
    agentMessage,
    agentMood,
    confidence,
    analyze,
  } = useAgentAnalysis();

  const market = MARKETS[currentMarket];

  // Keep a ref to ethPrice so we can gate analysis without re-triggering
  const ethPriceRef = useRef(ethPrice);
  ethPriceRef.current = ethPrice;

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Ticker animation
  useEffect(() => {
    const t = setInterval(() => setTickerOffset((o) => o - 1), 50);
    return () => clearInterval(t);
  }, []);

  // Agent analysis on market change (gated on having price data)
  useEffect(() => {
    setShowDecision(false);
    if (ethPriceRef.current !== null) {
      analyze();
    }
  }, [currentMarket, analyze]);

  // Trigger first analysis once price data arrives
  const hasAnalyzedRef = useRef(false);
  useEffect(() => {
    if (ethPrice !== null && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true;
      analyze();
    }
  }, [ethPrice, analyze]);

  const handleDecision = (action) => {
    const amt = 50;
    const newDecision = {
      market: market.question,
      coin: market.coin,
      action,
      price: action === "yes" ? market.yesPrice : 1 - market.yesPrice,
      amount: amt,
      timestamp: new Date(),
    };
    setDecisions((prevDecisions) => [newDecision, ...prevDecisions]);

    if (action === "yes" || action === "no") {
      setPortfolio((p) => ({
        balance: p.balance - amt,
        positions: [...p.positions, newDecision],
      }));
      setFlashColor(action === "yes" ? "#98c379" : "#e06c75");
      setBounce(true);
    } else {
      setFlashColor("#abb2bf");
    }

    setTimeout(() => {
      setFlashColor(null);
      setBounce(false);
    }, 400);

    setTimeout(() => {
      setCurrentMarket((c) => (c + 1) % MARKETS.length);
    }, 1200);
  };

  // Build ticker text from live FTSO prices + market questions
  const tickerText = (() => {
    const priceParts = Object.entries(allPrices).map(
      ([symbol, price]) =>
        `${symbol} $${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    );

    const marketParts = MARKETS.map(
      (m) => `${m.coin} "${m.question}" YES:${(m.yesPrice * 100).toFixed(0)}¢`
    );

    if (priceParts.length > 0) {
      return [...priceParts, ...marketParts].join("  ◆  ");
    }
    return marketParts.join("  ◆  ");
  })();

  const formatTime = (d) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1117",
        fontFamily: "'Press Start 2P', monospace",
        padding: 16,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(97,175,239,0.3); }
          50% { box-shadow: 0 0 20px rgba(97,175,239,0.6); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1px, -1px); }
          20% { transform: translate(1px, 0px); }
          30% { transform: translate(0px, 1px); }
          40% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
        }
        * { box-sizing: border-box; image-rendering: pixelated; }
        button { font-family: 'Press Start 2P', monospace; cursor: pointer; }
        button:active { transform: scale(0.95); }
      `}</style>

      <div
        style={{
          width: 420,
          background: "#161b22",
          border: "3px solid #30363d",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          boxShadow: flashColor
            ? `0 0 30px ${flashColor}40, inset 0 0 30px ${flashColor}10`
            : "0 4px 24px rgba(0,0,0,0.5), 0 0 8px rgba(97,175,239,0.1)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* TOP BAR */}
        <Navigation
          screen={screen}
          setScreen={setScreen}
          time={time}
          balance={portfolio.balance}
          formatTime={formatTime}
        />

        {/* TICKER */}
        <Ticker tickerOffset={tickerOffset} tickerText={tickerText} />

        {/* SCREENS */}
        {screen === "main" && (
          <MainScreen
            market={market}
            bounce={bounce}
            agentMood={agentMood}
            agentMessage={agentMessage}
            confidence={confidence}
            showDecision={showDecision}
            setShowDecision={setShowDecision}
            handleDecision={handleDecision}
            markets={MARKETS}
            currentMarket={currentMarket}
            setCurrentMarket={setCurrentMarket}
          />
        )}

        {screen === "portfolio" && (
          <PortfolioScreen portfolio={portfolio} />
        )}

        {screen === "history" && (
          <HistoryScreen decisions={decisions} />
        )}

        {/* BOTTOM BAR */}
        <div
          style={{
            borderTop: "2px solid #30363d",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#0d1117",
          }}
        >
          <span style={{ fontSize: 6, color: "#484f58" }}>
            FTSO v2 · {priceLoading ? "connecting..." : priceError ? "ERROR" : `$${ethPrice?.toFixed(0)}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: priceError ? "#e06c75" : priceLoading ? "#e5c07b" : "#98c379",
                animation: !priceError && !priceLoading ? "pulse-glow 2s ease infinite" : "none",
                boxShadow: priceError ? "0 0 4px #e06c75" : priceLoading ? "0 0 4px #e5c07b" : "0 0 4px #98c379",
              }}
            />
            <span style={{ fontSize: 6, color: "#484f58" }}>
              {priceError ? "ERR" : priceLoading ? "..." : "LIVE"}
            </span>
          </div>
          <span style={{ fontSize: 6, color: "#484f58" }}>COSTON2</span>
        </div>
      </div>
    </div>
  );
}
