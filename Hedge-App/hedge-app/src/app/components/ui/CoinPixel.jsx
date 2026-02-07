import PixelGrid from "./PixelGrid";

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

export const COIN_COLORS = { ETH: "#627eea", BTC: "#f7931a", FLR: "#e62058" };

export default function CoinPixel({ coin, size = 3 }) {
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
