import MarketCard from "../widgets/MarketCard";
import AgentCharacter from "../widgets/AgentCharacter";
import TypeWriter from "../ui/TypeWriter";
import DecisionButtons from "../widgets/DecisionButtons";

export default function MainScreen({
  market,
  bounce,
  agentMood,
  agentMessage,
  showDecision,
  setShowDecision,
  handleDecision,
  markets,
  currentMarket,
  setCurrentMarket,
}) {
  return (
    <div style={{ padding: 16 }}>
      {/* Market Card */}
      <MarketCard market={market} bounce={bounce} />

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
        <AgentCharacter agentMood={agentMood} />

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
      <DecisionButtons
        showDecision={showDecision}
        handleDecision={handleDecision}
        markets={markets}
        currentMarket={currentMarket}
        setCurrentMarket={setCurrentMarket}
      />
    </div>
  );
}
