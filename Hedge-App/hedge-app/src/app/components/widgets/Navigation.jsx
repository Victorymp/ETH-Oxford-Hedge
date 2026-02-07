export default function Navigation({ screen, setScreen, time, balance, formatTime }) {
  return (
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
          ◆ {balance}
        </div>
      </div>
    </div>
  );
}
