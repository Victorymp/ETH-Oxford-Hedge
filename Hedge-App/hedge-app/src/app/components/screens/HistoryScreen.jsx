import { COIN_COLORS } from "../ui/CoinPixel";

export default function HistoryScreen({ decisions }) {
  return (
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
  );
}
