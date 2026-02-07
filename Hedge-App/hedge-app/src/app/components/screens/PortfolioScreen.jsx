import CoinPixel from "../ui/CoinPixel";

export default function PortfolioScreen({ portfolio }) {
  return (
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
  );
}
