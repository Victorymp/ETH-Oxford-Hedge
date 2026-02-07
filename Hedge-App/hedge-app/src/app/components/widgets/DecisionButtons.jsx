export default function DecisionButtons({ showDecision, handleDecision, markets, currentMarket, setCurrentMarket }) {
  return (
    <>
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
        {markets.map((_, i) => (
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
    </>
  );
}
