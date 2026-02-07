"use client";

import { useState, useCallback } from "react";

export default function useAgentAnalysis() {
  const [agentMessage, setAgentMessage] = useState("");
  const [agentMood, setAgentMood] = useState("idle");
  const [confidence, setConfidence] = useState(0.5);
  const [market, setMarket] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAgentMood("thinking");
    setAgentMessage("");
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      // Map AI mood to agent character mood
      const moodMap = {
        bullish: "happy",
        bearish: "idle",
        neutral: "idle",
      };

      setAgentMessage(data.message || "Signal unclear...");
      setAgentMood(moodMap[data.mood] || "idle");
      setConfidence(data.confidence || 0.5);
      setMarket(data.market || null);
    } catch (err) {
      console.error("Agent analysis failed:", err);
      setError(err.message);

      const fallbacks = [
        "FTSO feeds are acting up...",
        "Oracle connection unstable, trust your gut",
        "Can't read the chain right now, stand by",
      ];
      setAgentMessage(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      setAgentMood("idle");
      setConfidence(0.5);
      setMarket(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    agentMessage,
    agentMood,
    confidence,
    market,
    isAnalyzing,
    error,
    analyze,
  };
}
