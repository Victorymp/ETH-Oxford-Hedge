export default function PixelGrid({ grid, colors, pixelSize = 4 }) {
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
