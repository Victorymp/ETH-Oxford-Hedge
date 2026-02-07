export default function Ticker({ tickerOffset, tickerText }) {
  return (
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
  );
}
