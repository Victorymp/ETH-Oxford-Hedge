"use client";

import { useState, useEffect, useRef } from "react";

// Pixel art characters
const FRAMES = {
  idle: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,3,2,2,3,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,2,4,4,2,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
  ],
  happy: [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,6,2,2,6,2,1,0],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,2,7,4,4,7,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,1,5,5,5,5,5,5,1,0],
    [0,0,1,5,5,5,5,1,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,0],
  ],
};

const PIXEL_COLORS = {
  0: "transparent", 1: "#1a1a2e", 2: "#f0c674", 3: "#1a1a2e",
  4: "#e06c75", 5: "#61afef", 6: "#1a1a2e", 7: "#e06c75",
};

function PixelGrid({ grid, colors, pixelSize = 4 }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 0 }}>
      {grid.map((row, y) => (
        <div key={y} style={{ display: "flex" }}>
          {row.map((cell, x) => (
            <div key={x} style={{ width: pixelSize, height: pixelSize, backgroundColor: colors[cell] || "transparent" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Timeline data
const TIMELINE = [
  { year: "1969", name: "Ed Thorp", desc: "Princeton Newport Partners. Beat the dealer, then beat the market. First quant fund ever.", color: "#e5c07b", outcome: "success" },
  { year: "1982", name: "Renaissance", desc: "Jim Simons hires physicists, not traders. Medallion Fund: 66% avg returns. The GOAT.", color: "#98c379", outcome: "success" },
  { year: "1994", name: "LTCM", desc: "Two Nobel laureates. No risk bounds. No exit conditions. Infinite-looped into $4.6B collapse.", color: "#e06c75", outcome: "failure" },
  { year: "2025", name: "Hedge", desc: "AICL bounded agents. FTSO oracle feeds. Cycle detection. Renaissance for everyone — in a widget.", color: "#61afef", outcome: "you" },
];

const FEATURES = [
  { icon: "◈", title: "FTSO ORACLE", desc: "94 providers. 1.8s latency. $970M staked security. Real prices, not vibes.", color: "#e62058" },
  { icon: "◆", title: "AICL CONTROL", desc: "Bounded loops. Budget tracking. Find the correct market. Your agent can't infinite-loop your wallet.", color: "#61afef" },
  { icon: "▲", title: "POLYMARKET", desc: "Prediction market signals. AI reads the odds so you don't have to.", color: "#c678dd" },
  { icon: "●", title: "REFRESH CYCLE", desc: "Don't like the insight? Skip it. Agent regenerates fresh opportunities from live data. Always moving forward.", color: "#98c379" },
];

const PROBLEM_STATS = [
  { stat: "72%", label: "of retail day traders lose money (FINRA)", color: "#e06c75" },
  { stat: "$4.6B", label: "LTCM collapse — no exit conditions", color: "#e5c07b" },
  { stat: "∞", label: "gas burned by unbounded agents", color: "#c678dd" },
];

function TypeWriter({ text, speed = 25 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}{!done && <span style={{ animation: "blink 0.5s step-end infinite" }}>▌</span>}</span>;
}

function PixelDivider({ color = "#30363d" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 3, padding: "24px 0" }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ width: 4, height: 4, background: i % 3 === 0 ? color : "#21262d", borderRadius: 1 }} />
      ))}
    </div>
  );
}

export default function HedgePitch() {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [tickerOffset, setTickerOffset] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(-1);
  const [time, setTime] = useState(new Date());
  const sectionRefs = useRef({});

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerOffset(o => o - 1), 40);
    return () => clearInterval(t);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.2 }
    );
    Object.values(sectionRefs.current).forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  // Auto-reveal timeline
  useEffect(() => {
    if (visibleSections.has("timeline")) {
      TIMELINE.forEach((_, i) => {
        setTimeout(() => setActiveTimeline(i), 400 * (i + 1));
      });
    }
  }, [visibleSections]);

  const tickerText = "◆ HEDGE — Renaissance for everyone ◆ FTSO v2 · 94 providers · 1.8s feeds ◆ AICL bounded agents · live insights · skip to refresh ◆ ETH Oxford 2026 ◆ Never miss a dip ◆";

  const formatTime = d => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const ref = name => el => { if (el) { sectionRefs.current[name] = el; } };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0d1117", fontFamily: "'Press Start 2P', monospace", color: "#c9d1d9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 8px rgba(97,175,239,0.3); } 50% { box-shadow: 0 0 24px rgba(97,175,239,0.6); } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(200vh); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -2px); }
          80% { transform: translate(1px, 2px); }
        }
        @keyframes barGrow { from { width: 0; } to { width: var(--target-width); } }
        * { box-sizing: border-box; image-rendering: pixelated; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #61afef; }
      `}</style>

      {/* Scanline overlay */}
      <div style={{ position: "fixed", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none", zIndex: 100 }} />

      {/* TOP NAV BAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#0d1117", borderBottom: "2px solid #30363d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PixelGrid grid={FRAMES.happy} colors={PIXEL_COLORS} pixelSize={2} />
            <span style={{ fontSize: 10, color: "#61afef", letterSpacing: 2 }}>HEDGE</span>
          </div>
          <div style={{ fontSize: 9, color: "#61afef", background: "#161b22", padding: "4px 10px", border: "1px solid #30363d", borderRadius: 4 }}>
            {formatTime(time)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#98c379", animation: "pulse-glow 2s ease infinite", boxShadow: "0 0 4px #98c379" }} />
            <span style={{ fontSize: 7, color: "#484f58" }}>ETH OXFORD 2026</span>
          </div>
        </div>

        {/* TICKER */}
        <div style={{ background: "#161b22", borderTop: "1px solid #30363d", overflow: "hidden", padding: "5px 0", position: "relative" }}>
          <div style={{ whiteSpace: "nowrap", fontSize: 7, color: "#8b949e", transform: `translateX(${tickerOffset % (tickerText.length * 5.2)}px)` }}>
            {tickerText}{"  "}{tickerText}{"  "}{tickerText}
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(90deg, #161b22, transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: "linear-gradient(-90deg, #161b22, transparent)", pointerEvents: "none" }} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>

        {/* ═══════ HERO ═══════ */}
        <div style={{ textAlign: "center", padding: "60px 0 40px", position: "relative" }}>
          <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 20 }}>
            <PixelGrid grid={FRAMES.happy} colors={PIXEL_COLORS} pixelSize={6} />
          </div>

          <div style={{ fontSize: 7, color: "#e62058", letterSpacing: 4, marginBottom: 12 }}>
            FTSO VERIFIED · AICL BOUNDED · POLYMARKET POWERED
          </div>

          <h1 style={{ fontSize: 20, color: "#e6edf3", lineHeight: 1.6, margin: "0 0 16px", fontFamily: "'Press Start 2P', monospace" }}>
            <span style={{ color: "#61afef" }}>HEDGE</span>
          </h1>

          <div style={{ fontSize: 11, color: "#c9d1d9", lineHeight: 2.2, maxWidth: 560, margin: "0 auto 24px" }}>
            <TypeWriter text="Renaissance Capital for everyone. Delivered as a widget." speed={30} />
          </div>

          <div style={{ fontSize: 8, color: "#8b949e", lineHeight: 2, maxWidth: 500, margin: "0 auto" }}>
            An AI agent that watches prediction markets, reads FTSO oracle feeds, and surfaces real-time crypto insights — with a skip button when you want fresh ones.
          </div>

          <PixelDivider color="#61afef" />
        </div>

        {/* ═══════ THE PROBLEM ═══════ */}
        <div ref={ref("problem")} data-section="problem" style={{ padding: "20px 0 40px", opacity: visibleSections.has("problem") ? 1 : 0, transform: visibleSections.has("problem") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ fontSize: 7, color: "#e06c75", letterSpacing: 3, marginBottom: 16 }}>THE PROBLEM</div>
          <div style={{ fontSize: 12, color: "#e6edf3", lineHeight: 1.8, marginBottom: 24 }}>
            Quant funds made billions.<br />Retail traders got nothing.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {PROBLEM_STATS.map((s, i) => (
              <div key={i} style={{ background: "#161b22", border: "2px solid #30363d", borderRadius: 8, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 20, color: s.color, marginBottom: 8 }}>{s.stat}</div>
                <div style={{ fontSize: 7, color: "#8b949e", lineHeight: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: "#e06c7510", border: "1px solid #e06c7530", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 8, color: "#e06c75", lineHeight: 2 }}>
              The average person can't access real-time crypto intelligence. Prediction markets exist but nobody explains them. AI agents exist but they drain wallets with unbounded execution. The tools are there — the interface isn't.
            </div>
          </div>

          <PixelDivider />
        </div>

        {/* ═══════ TIMELINE ═══════ */}
        <div ref={ref("timeline")} data-section="timeline" style={{ padding: "20px 0 40px", opacity: visibleSections.has("timeline") ? 1 : 0, transform: visibleSections.has("timeline") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ fontSize: 7, color: "#e5c07b", letterSpacing: 3, marginBottom: 16 }}>THE LINEAGE</div>
          <div style={{ fontSize: 12, color: "#e6edf3", lineHeight: 1.8, marginBottom: 30 }}>
            From card counting to control loops
          </div>

          <div style={{ position: "relative", paddingLeft: 40 }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: "#30363d" }} />

            {TIMELINE.map((t, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 24,
                  opacity: activeTimeline >= i ? 1 : 0.15,
                  transform: activeTimeline >= i ? "translateX(0)" : "translateX(-10px)",
                  transition: "all 0.5s ease",
                  position: "relative",
                }}
              >
                {/* Node dot */}
                <div style={{
                  position: "absolute", left: -32, top: 6, width: 10, height: 10,
                  borderRadius: "50%", background: activeTimeline >= i ? t.color : "#30363d",
                  border: `2px solid ${t.color}`, transition: "all 0.5s ease",
                  boxShadow: activeTimeline >= i ? `0 0 8px ${t.color}60` : "none",
                }} />

                <div style={{ background: "#161b22", border: `2px solid ${activeTimeline >= i ? t.color + "40" : "#30363d"}`, borderRadius: 8, padding: 16, transition: "border-color 0.5s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: t.color }}>{t.year}</span>
                    <span style={{ fontSize: 9, color: "#e6edf3" }}>{t.name}</span>
                    {t.outcome === "failure" && <span style={{ fontSize: 6, color: "#e06c75", background: "#e06c7520", padding: "2px 6px", borderRadius: 3, border: "1px solid #e06c7530" }}>CRASHED</span>}
                    {t.outcome === "you" && <span style={{ fontSize: 6, color: "#61afef", background: "#61afef20", padding: "2px 6px", borderRadius: 3, border: "1px solid #61afef30", animation: "pulse-glow 2s ease infinite" }}>BUILDING</span>}
                  </div>
                  <div style={{ fontSize: 8, color: "#8b949e", lineHeight: 2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* LTCM vs HEDGE comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            <div style={{ background: "#161b22", border: "2px solid #e06c7540", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 8, color: "#e06c75", marginBottom: 10 }}>LTCM (1994)</div>
              <div style={{ fontSize: 7, color: "#8b949e", lineHeight: 2.2 }}>
                ✗ No budget bounds<br />
                ✗ No cycle detection<br />
                ✗ No exit conditions<br />
                ✗ ReAct-style execution<br />
                <span style={{ color: "#e06c75" }}>→ $4.6B collapse</span>
              </div>
            </div>
            <div style={{ background: "#161b22", border: "2px solid #61afef40", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 8, color: "#61afef", marginBottom: 10 }}>HEDGE (2025)</div>
              <div style={{ fontSize: 7, color: "#8b949e", lineHeight: 2.2 }}>
                ✓ AICL bounded loops<br />
                ✓ Explicit exit insights<br />
                ✓ Up-to-date ticker on prices<br />
                ✓ Agent-curated opportunities<br />
                <span style={{ color: "#98c379" }}>→ Informed, bounded decisions</span>
              </div>
            </div>
          </div>

          <PixelDivider />
        </div>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <div ref={ref("how")} data-section="how" style={{ padding: "20px 0 40px", opacity: visibleSections.has("how") ? 1 : 0, transform: visibleSections.has("how") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ fontSize: 7, color: "#c678dd", letterSpacing: 3, marginBottom: 16 }}>HOW IT WORKS</div>
          <div style={{ fontSize: 12, color: "#e6edf3", lineHeight: 1.8, marginBottom: 30 }}>
            Sense → Think → Act → Observe → Loop
          </div>

          {/* AICL flow diagram */}
          <div style={{ background: "#161b22", border: "2px solid #30363d", borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {[
                { phase: "SENSE", desc: "Read FTSO feeds, Polymarket odds, portfolio state", color: "#61afef", icon: "◈" },
                { phase: "THINK", desc: "AI agent analyzes data, ranks opportunities", color: "#c678dd", icon: "◆" },
                { phase: "ACT", desc: "One bounded action — present decision to user", color: "#98c379", icon: "▲" },
                { phase: "OBSERVE", desc: "Check result, detect cycles, update budget", color: "#e5c07b", icon: "●" },
              ].map((step, i) => (
                <div key={i} style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0d1117", border: `1px solid ${step.color}30`, borderRadius: 6, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, color: step.color }}>{step.icon}</span>
                    <div>
                      <div style={{ fontSize: 8, color: step.color, marginBottom: 4 }}>{step.phase}</div>
                      <div style={{ fontSize: 7, color: "#8b949e", lineHeight: 1.8 }}>{step.desc}</div>
                    </div>
                  </div>
                  {i < 3 && (
                    <div style={{ textAlign: "center", fontSize: 8, color: "#30363d", padding: "4px 0" }}>▼</div>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 8 }}>
                <div style={{ flex: 1, background: "#98c37915", border: "1px solid #98c37930", borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "#98c379" }}>GOAL MET?</div>
                  <div style={{ fontSize: 6, color: "#8b949e", marginTop: 4 }}>✓ EXIT</div>
                </div>
                <div style={{ flex: 1, background: "#e06c7515", border: "1px solid #e06c7530", borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "#e06c75" }}>CYCLE?</div>
                  <div style={{ fontSize: 6, color: "#8b949e", marginTop: 4 }}>✗ EXIT SAFE</div>
                </div>
                <div style={{ flex: 1, background: "#61afef15", border: "1px solid #61afef30", borderRadius: 6, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: "#61afef" }}>SKIP?</div>
                  <div style={{ fontSize: 6, color: "#8b949e", marginTop: 4 }}>↻ NEW INSIGHT</div>
                </div>
              </div>
            </div>
          </div>

          <PixelDivider />
        </div>

        {/* ═══════ FEATURES ═══════ */}
        <div ref={ref("features")} data-section="features" style={{ padding: "20px 0 40px", opacity: visibleSections.has("features") ? 1 : 0, transform: visibleSections.has("features") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ fontSize: 7, color: "#98c379", letterSpacing: 3, marginBottom: 16 }}>THE STACK</div>
          <div style={{ fontSize: 12, color: "#e6edf3", lineHeight: 1.8, marginBottom: 30 }}>
            Four systems. One widget.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: "#161b22", border: "2px solid #30363d", borderRadius: 8, padding: 16, transition: "border-color 0.3s ease" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = f.color + "60"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#30363d"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: f.color }}>{f.icon}</span>
                  <span style={{ fontSize: 8, color: f.color, letterSpacing: 1 }}>{f.title}</span>
                </div>
                <div style={{ fontSize: 7, color: "#8b949e", lineHeight: 2 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <PixelDivider />
        </div>

        {/* ═══════ OPPORTUNITY MARKETS ═══════ */}
        <div ref={ref("opportunity")} data-section="opportunity" style={{ padding: "20px 0 40px", opacity: visibleSections.has("opportunity") ? 1 : 0, transform: visibleSections.has("opportunity") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ fontSize: 7, color: "#e5c07b", letterSpacing: 3, marginBottom: 16 }}>OPPORTUNITY MARKETS</div>
          <div style={{ fontSize: 12, color: "#e6edf3", lineHeight: 1.8, marginBottom: 20 }}>
            Agents don't just react. They create.
          </div>

          <div style={{ background: "#161b22", border: "2px solid #e5c07b30", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 8, color: "#c9d1d9", lineHeight: 2.2, marginBottom: 16 }}>
              Inspired by Paradigm's Opportunity Markets paper. Instead of waiting for markets to move, Hedge agents proactively identify signals across prediction markets and oracle feeds — creating hedging opportunities before they become obvious.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#e5c07b", marginBottom: 6 }}>◈</div>
                <div style={{ fontSize: 7, color: "#e5c07b", marginBottom: 4 }}>SCOUT</div>
                <div style={{ fontSize: 6, color: "#8b949e", lineHeight: 1.8 }}>Agent scouts signals across FTSO + Polymarket data</div>
              </div>
              <div style={{ fontSize: 12, color: "#30363d", alignSelf: "center" }}>→</div>
              <div style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#c678dd", marginBottom: 6 }}>◆</div>
                <div style={{ fontSize: 7, color: "#c678dd", marginBottom: 4 }}>SUGGEST</div>
                <div style={{ fontSize: 6, color: "#8b949e", lineHeight: 1.8 }}>Presents opportunity to user as a card</div>
              </div>
              <div style={{ fontSize: 12, color: "#30363d", alignSelf: "center" }}>→</div>
              <div style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#98c379", marginBottom: 6 }}>▲</div>
                <div style={{ fontSize: 7, color: "#98c379", marginBottom: 4 }}>DECIDE</div>
                <div style={{ fontSize: 6, color: "#8b949e", lineHeight: 1.8 }}>User accepts, rejects, or skips to refresh</div>
              </div>
            </div>
          </div>

          <PixelDivider />
        </div>

        {/* ═══════ THE PITCH ═══════ */}
        <div ref={ref("pitch")} data-section="pitch" style={{ padding: "20px 0 60px", opacity: visibleSections.has("pitch") ? 1 : 0, transform: visibleSections.has("pitch") ? "translateY(0)" : "translateY(30px)", transition: "all 0.6s ease" }}>
          <div style={{ background: "#161b22", border: "2px solid #61afef40", borderRadius: 12, padding: 30, textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* Subtle corner accents */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 30, height: 2, background: "#61afef" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 30, background: "#61afef" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 2, background: "#61afef" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 2, height: 30, background: "#61afef" }} />

            <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: 16 }}>
              <PixelGrid grid={FRAMES.happy} colors={PIXEL_COLORS} pixelSize={5} />
            </div>

            <div style={{ fontSize: 7, color: "#e62058", letterSpacing: 3, marginBottom: 14 }}>THE PITCH</div>

            <div style={{ fontSize: 13, color: "#e6edf3", lineHeight: 2, marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
              "In 1969, Ed Thorp proved math could beat markets. In 1994, LTCM proved unbounded systems crash. In 2025, we built the bridge: a bounded AI agent that delivers quant-grade insights to everyone — in a widget you can't stop refreshing."
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {["FTSO Oracle", "AICL Control Loops", "Polymarket", "Live Ticker", "Refresh Cycle"].map((tag, i) => (
                <span key={i} style={{ fontSize: 6, color: "#61afef", background: "#61afef15", padding: "4px 10px", borderRadius: 4, border: "1px solid #61afef30" }}>{tag}</span>
              ))}
            </div>

            <div style={{ marginTop: 20, fontSize: 7, color: "#484f58" }}>
              Never miss a dip. Always a fresh insight away.
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "2px solid #30363d", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, background: "#0d1117" }}>
        <span style={{ fontSize: 6, color: "#484f58" }}>FTSO v2 · 1.8s</span>
        <span style={{ fontSize: 6, color: "#484f58" }}>·</span>
        <span style={{ fontSize: 6, color: "#484f58" }}>AICL BOUNDED</span>
        <span style={{ fontSize: 6, color: "#484f58" }}>·</span>
        <span style={{ fontSize: 6, color: "#484f58" }}>ETH OXFORD 2026</span>
        <span style={{ fontSize: 6, color: "#484f58" }}>·</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#98c379", boxShadow: "0 0 4px #98c379" }} />
          <span style={{ fontSize: 6, color: "#484f58" }}>LIVE</span>
        </div>
      </div>
    </div>
  );
}