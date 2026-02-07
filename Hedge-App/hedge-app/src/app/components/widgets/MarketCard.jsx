import CoinPixel from "../ui/CoinPixel";
import { COIN_COLORS } from "../ui/CoinPixel";
import PriceBar from "../ui/PriceBar";

export default function MarketCard({ market, bounce, slugFound }) {
  return (
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
      {slugFound ? (
        <>
          {/* Market header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CoinPixel coin={market.coin} size={3} />
            <span style={{ fontSize: 8, color: COIN_COLORS[market.coin], letterSpacing: 1 }}>
              {market.coin}
            </span>
            {market.change != null && (
              <span
                style={{
                  fontSize: 7,
                  color: market.change > 0 ? "#98c379" : "#e06c75",
                  marginLeft: "auto",
                }}
              >
                {market.change > 0 ? "▲" : "▼"} {Math.abs(market.change).toFixed(1)}%
              </span>
            )}
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
          <PriceBar yesPrice={market.yesPrice} />

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
        </>
      ) : (
        <div
          style={{
            fontSize: 8,
            color: "#8b949e",
            textAlign: "center",
            lineHeight: 2,
            padding: "16px 8px",
          }}
        >
          No current markets found for hedge against your current position
        </div>
      )}
    </div>
  );
}
