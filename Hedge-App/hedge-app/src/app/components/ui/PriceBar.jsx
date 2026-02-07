export default function PriceBar({ yesPrice }) {
  return (
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
        <span>YES {(yesPrice * 100).toFixed(0)}¢</span>
        <span>NO {((1 - yesPrice) * 100).toFixed(0)}¢</span>
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
            width: `${yesPrice * 100}%`,
            background: "linear-gradient(90deg, #98c379, #61afef)",
            borderRadius: 4,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
