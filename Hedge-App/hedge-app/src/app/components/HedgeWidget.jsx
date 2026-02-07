"use client";

import { useState, useEffect, useRef } from "react";

// Pixel art characters as CSS grid patterns
const AGENT_FRAMES = {
  idle: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,3,2,2,3,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,2,4,4,2,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
  ],
  happy: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,6,2,2,6,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,7,4,4,7,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
  ],
  thinking: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,3,2,2,8,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,2,9,4,2,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
  ],
};

const PIXEL_COLORS = {
  0: "transparent",
  1: "#1a1a2e",
  2: "#f0c674",
  3: "#1a1a2e",
  4: "#e06c75",
  5: "#61afef",
  6: "#1a1a2e",
  7: "#e06c75",
  8: "#c678dd",
  9: "#e06c75",
};

const COIN_ICONS = {
  ETH: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ],
  BTC: [
    [0,1,1,1,1,1,0],
    [1,0,1,0,0,1,0],
    [1,0,1,1,1,0,0],
    [1,0,1,0,0,1,0],
    [1,0,1,1,1,0,0],
    [1,0,1,0,0,1,0],
    [0,1,1,1,1,1,0],
  ],
  FLR: [
    [1,1,1,1,1,1,0],
    [1,0,0,0,0,0,0],
    [1,1,1,1,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
  ],
};

const COIN_COLORS = { ETH: "#627eea", BTC: "#f7931a", FLR: "#e62058" };

function PixelGrid({ grid, colors, pixelSize = 4 }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 0, lineHeight: 0 }}>
      {grid.map((row, y) => (
        <div key={y} style={{ display: "flex", gap: 0 }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: colors[cell] || "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CoinPixel({ coin, size = 3 }) {
  const grid = COIN_ICONS[coin];
  if (!grid) return null;
  const c = COIN_COLORS[coin];
  return (
    <PixelGrid
      grid={grid}
      colors={{ 0: "transparent", 1: c }}
      pixelSize={size}
    />
  );
}

// Simulated market data
const MARKETS = [
  { id: 1, coin: "ETH", question: "ETH will hit $4k by March?", yesPrice: 0.62, change: +5.2, sentiment: "bullish" },
  { id: 2, coin: "BTC", question: "BTC dominance > 55% in Feb?", yesPrice: 0.78, change: -2.1, sentiment: "bearish" },
  { id: 3, coin: "FLR", question: "FLR TVL doubles by Q2?", yesPrice: 0.34, change: +12.7, sentiment: "bullish" },
  { id: 4, coin: "ETH", question: "ETH staking yield > 5%?", yesPrice: 0.45, change: +1.8, sentiment: "neutral" },
  { id: 5, coin: "BTC", question: "BTC ETF inflows > $1B Feb?", yesPrice: 0.81, change: +0.4, sentiment: "bullish" },
];

const AGENT_MESSAGES = {
  bullish: [
    "Oi! This one's looking spicy 🔥",
    "The charts don't lie... mostly 📈",
    "I'd bet my last pixel on this!",
    "FTSO data confirms the vibe ✨",
  ],
  bearish: [
    "Hmm, tread carefully here...",
    "My pixel senses are tingling ⚠️",
    "The data says nah on this one",
    "Maybe skip this round, friend",
  ],
  neutral: [
    "Could go either way tbh 🤷",
    "The oracle is... uncertain",
    "Flip a coin? Just kidding, let's analyze",
    "Needs more data, checking FTSO...",
  ],
};

function TypeWriter({ text, speed = 35, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ animation: "blink 0.5s step-end infinite" }}>▌</span>}
    </span>
  );
}

export default function HedgeWidget() {
  const [currentMarket, setCurrentMarket] = useState(0);
  const [agentMood, setAgentMood] = useState("idle");
  const [agentMessage, setAgentMessage] = useState("");
  const [showDecision, setShowDecision] = useState(false);
  const [decisions, setDecisions] = useState([]);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [time, setTime] = useState(new Date());
  const [portfolio, setPortfolio] = useState({ balance: 1000, positions: [] });
  const [screen, setScreen] = useState("main"); // main, portfolio, history
  const [bounce, setBounce] = useState(false);
  const [flashColor, setFlashColor] = useState(null);

  const market = MARKETS[currentMarket];

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

  // Agent analysis on market change
  useEffect(() => {
    setAgentMood("thinking");
    setShowDecision(false);
    setAgentMessage("");
    const msgs = AGENT_MESSAGES[market.sentiment];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    const timer = setTimeout(() => {
      setAgentMood(market.sentiment === "bullish" ? "happy" : "idle");
      setAgentMessage(msg);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentMarket]);

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
    setDecisions([newDecision, ...decisions]);

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

    // Next market after short delay
    setTimeout(() => {
      setCurrentMarket((c) => (c + 1) % MARKETS.length);
    }, 1200);
  };

  const tickerText = MARKETS.map(
    (m) =>
      `${m.coin} "${m.question}" YES:${(m.yesPrice * 100).toFixed(0)}¢ ${m.change > 0 ? "▲" : "▼"}${Math.abs(m.change).toFixed(1)}%`
  ).join("  ◆  ");

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

        {/* TOP BAR: Nav + Clock */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "#0d1117",
            borderBottom: "2px solid #30363d",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["main", "portfolio", "history"].map((s) => (
              <button
                key={s}
                onClick={() => setScreen(s)}
                style={{
                  background: screen === s ? "#21262d" : "transparent",
                  border: screen === s ? "1px solid #61afef" : "1px solid #30363d",
                  color: screen === s ? "#61afef" : "#8b949e",
                  fontSize: 7,
                  padding: "4px 8px",
                  borderRadius: 4,
                  transition: "all 0.2s",
                }}
              >
                {s === "main" ? "📊" : s === "portfolio" ? "💰" : "📜"}
              </button>
            ))}
          </div>

          <div
            style={{
              color: "#61afef",
              fontSize: 9,
              fontFamily: "'Press Start 2P', monospace",
              background: "#0d1117",
              padding: "3px 8px",
              border: "1px solid #30363d",
              borderRadius: 4,
            }}
          >
            {formatTime(time)}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              style={{
                fontSize: 7,
                color: "#98c379",
                background: "#0d1117",
                padding: "3px 8px",
                border: "1px solid #30363d",
                borderRadius: 4,
              }}
            >
              ◆ {portfolio.balance}
            </div>
          </div>
        </div>

        {/* TICKER */}
        <div
          style={{
            background: "#0d1117",
            borderBottom: "2px solid #30363d",
            overflow: "hidden",
            padding: "6px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              whiteSpace: "nowrap",
              fontSize: 7,
              color: "#c9d1d9",
              transform: `translateX(${tickerOffset % (tickerText.length * 5.5)}px)`,
              gap: 0,
            }}
          >
            <span>
              {tickerText}{"  ◆  "}{tickerText}
            </span>
          </div>
          {/* Fade edges */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 30, background: "linear-gradient(90deg, #0d1117, transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 30, background: "linear-gradient(-90deg, #0d1117, transparent)", pointerEvents: "none" }} />
        </div>

        {/* MAIN CONTENT */}
        {screen === "main" && (
          <div style={{ padding: 16 }}>
            {/* Market Card */}
            <div
              style={{
                background: "#0d1117",
                border: "2px solid #30363d",
                borderRadius: 8,
                padding: 14,
                marginBottom: 14,
                position: "relative",
                animation: bounce ? "shake 0.3s ease" : "none",
              }}
            >
              {/* Market header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <CoinPixel coin={market.coin} size={3} />
                <span style={{ fontSize: 8, color: COIN_COLORS[market.coin], letterSpacing: 1 }}>
                  {market.coin}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    color: market.change > 0 ? "#98c379" : "#e06c75",
                    marginLeft: "auto",
                  }}
                >
                  {market.change > 0 ? "▲" : "▼"} {Math.abs(market.change).toFixed(1)}%
                </span>
              </div>

              {/* Question */}
              <div
                style={{
                  fontSize: 9,
                  color: "#e6edf3",
                  lineHeight: 1.8,
                  marginBottom: 12,
                  minHeight: 36,
                }}
              >
                {market.question}
              </div>

              {/* Price bar */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 7,
                    color: "#8b949e",
                    marginBottom: 4,
                  }}
                >
                  <span>YES {(market.yesPrice * 100).toFixed(0)}¢</span>
                  <span>NO {((1 - market.yesPrice) * 100).toFixed(0)}¢</span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#21262d",
                    borderRadius: 4,
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${market.yesPrice * 100}%`,
                      background: "linear-gradient(90deg, #98c379, #61afef)",
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* FTSO badge */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 6,
                    color: "#e62058",
                    background: "#e6205810",
                    padding: "2px 6px",
                    borderRadius: 3,
                    border: "1px solid #e6205830",
                  }}
                >
                  FTSO VERIFIED
                </span>
                <span
                  style={{
                    fontSize: 6,
                    color: "#c678dd",
                    background: "#c678dd10",
                    padding: "2px 6px",
                    borderRadius: 3,
                    border: "1px solid #c678dd30",
                  }}
                >
                  POLYMARKET
                </span>
              </div>
            </div>

            {/* Agent Section */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              {/* Agent character */}
              <div
                style={{
                  flexShrink: 0,
                  animation: "float 2s ease-in-out infinite",
                  background: "#0d1117",
                  border: "2px solid #30363d",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <PixelGrid grid={AGENT_FRAMES[agentMood]} colors={PIXEL_COLORS} pixelSize={4} />
                <span style={{ fontSize: 6, color: "#61afef" }}>HEDGE-BOT</span>
              </div>

              {/* Speech bubble */}
              <div
                style={{
                  flex: 1,
                  background: "#0d1117",
                  border: "2px solid #30363d",
                  borderRadius: "4px 12px 12px 12px",
                  padding: 10,
                  fontSize: 8,
                  color: "#c9d1d9",
                  lineHeight: 1.8,
                  minHeight: 60,
                  position: "relative",
                }}
              >
                {agentMood === "thinking" ? (
                  <span style={{ color: "#8b949e" }}>
                    <span style={{ animation: "blink 0.6s step-end infinite" }}>analyzing FTSO feeds...</span>
                  </span>
                ) : (
                  <TypeWriter
                    text={agentMessage}
                    speed={30}
                    onComplete={() => setShowDecision(true)}
                  />
                )}

                {/* Confidence meter */}
                {showDecision && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 6, color: "#8b949e" }}>CONF:</span>
                    <div style={{ flex: 1, height: 4, background: "#21262d", borderRadius: 2 }}>
                      <div
                        style={{
                          width: `${market.yesPrice * 100}%`,
                          height: "100%",
                          background:
                            market.sentiment === "bullish"
                              ? "#98c379"
                              : market.sentiment === "bearish"
                              ? "#e06c75"
                              : "#e5c07b",
                          borderRadius: 2,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 6, color: "#8b949e" }}>
                      {(market.yesPrice * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Buttons */}
            {showDecision && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <button
                  onClick={() => handleDecision("yes")}
                  style={{
                    flex: 1,
                    background: "#98c37920",
                    border: "2px solid #98c379",
                    color: "#98c379",
                    padding: "10px 8px",
                    borderRadius: 6,
                    fontSize: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#98c37940";
                    e.target.style.boxShadow = "0 0 12px #98c37940";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#98c37920";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  BUY YES ▲
                </button>
                <button
                  onClick={() => handleDecision("no")}
                  style={{
                    flex: 1,
                    background: "#e06c7520",
                    border: "2px solid #e06c75",
                    color: "#e06c75",
                    padding: "10px 8px",
                    borderRadius: 6,
                    fontSize: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e06c7540";
                    e.target.style.boxShadow = "0 0 12px #e06c7540";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#e06c7520";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  BUY NO ▼
                </button>
                <button
                  onClick={() => handleDecision("skip")}
                  style={{
                    background: "#30363d",
                    border: "2px solid #484f58",
                    color: "#8b949e",
                    padding: "10px 12px",
                    borderRadius: 6,
                    fontSize: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#484f58";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#30363d";
                  }}
                >
                  SKIP
                </button>
              </div>
            )}

            {/* Market dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 12,
              }}
            >
              {MARKETS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentMarket(i)}
                  style={{
                    width: i === currentMarket ? 16 : 6,
                    height: 6,
                    background: i === currentMarket ? "#61afef" : "#30363d",
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO SCREEN */}
        {screen === "portfolio" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: "#e6edf3", marginBottom: 12 }}>PORTFOLIO</div>

            <div
              style={{
                background: "#0d1117",
                border: "2px solid #30363d",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 7, color: "#8b949e", marginBottom: 6 }}>BALANCE</div>
              <div style={{ fontSize: 16, color: "#98c379" }}>◆ {portfolio.balance}</div>
              <div style={{ fontSize: 7, color: "#8b949e", marginTop: 6 }}>
                {portfolio.positions.length} POSITIONS
              </div>
            </div>

            {portfolio.positions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#8b949e",
                  fontSize: 7,
                  padding: 20,
                  lineHeight: 2,
                }}
              >
                No positions yet.<br />
                Start trading to build your portfolio!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {portfolio.positions.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 6,
                      padding: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CoinPixel coin={p.coin} size={2} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 7, color: "#c9d1d9", lineHeight: 1.6 }}>
                        {p.action.toUpperCase()} @ {(p.price * 100).toFixed(0)}¢
                      </div>
                      <div style={{ fontSize: 6, color: "#8b949e" }}>-◆{p.amount}</div>
                    </div>
                    <span
                      style={{
                        fontSize: 6,
                        color: p.action === "yes" ? "#98c379" : "#e06c75",
                      }}
                    >
                      {p.action === "yes" ? "▲ YES" : "▼ NO"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY SCREEN */}
        {screen === "history" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 9, color: "#e6edf3", marginBottom: 12 }}>DECISION LOG</div>

            {decisions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#8b949e",
                  fontSize: 7,
                  padding: 20,
                  lineHeight: 2,
                }}
              >
                No decisions yet.<br />
                Hedge-Bot is waiting for you!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {decisions.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 6,
                      padding: 8,
                      fontSize: 7,
                      color: "#c9d1d9",
                      lineHeight: 1.8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: COIN_COLORS[d.coin] }}>{d.coin}</span>
                      <span
                        style={{
                          color:
                            d.action === "yes"
                              ? "#98c379"
                              : d.action === "no"
                              ? "#e06c75"
                              : "#8b949e",
                        }}
                      >
                        {d.action.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 6, color: "#8b949e", marginTop: 2 }}>
                      {d.market}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <span style={{ fontSize: 6, color: "#484f58" }}>FTSO v2 · 1.8s</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#98c379",
                animation: "pulse-glow 2s ease infinite",
                boxShadow: "0 0 4px #98c379",
              }}
            />
            <span style={{ fontSize: 6, color: "#484f58" }}>LIVE</span>
          </div>
          <span style={{ fontSize: 6, color: "#484f58" }}>XRPL TRUSTLINE</span>
        </div>
      </div>
    </div>
  );
}