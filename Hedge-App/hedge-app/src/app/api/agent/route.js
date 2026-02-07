const AZURE_FUNCTION_URL = process.env.AZURE_FUNCTION_URL;

export async function POST(request) {
  try {
    if (!AZURE_FUNCTION_URL) {
      throw new Error("AZURE_FUNCTION_URL not configured");
    }

    const res = await fetch(AZURE_FUNCTION_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Azure Function returned ${res.status}`);
    }

    const data = await res.json();

    // Azure Function returns { output: "{ message, mood, confidence }" }
    // The output may be wrapped in markdown code fences like ```json ... ```
    let parsed;
    try {
      let raw = data.output;
      if (typeof raw === "string") {
        // Strip markdown code fences: ```json ... ``` or ``` ... ```
        raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        parsed = JSON.parse(raw);
      } else {
        parsed = raw;
      }
    } catch {
      // If the output isn't valid JSON, use it as the message directly
      parsed = {
        message: data.output || "Signal unclear, stand by...",
        mood: "neutral",
        confidence: 0.5,
      };
    }

    // Validate and sanitize
    const response = {
      message:
        typeof parsed.message === "string"
          ? parsed.message.slice(0, 120)
          : "FTSO data incoming...",
      mood: ["bullish", "bearish", "neutral"].includes(parsed.mood)
        ? parsed.mood
        : "neutral",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
      slug_found: parsed.slug_found === true,
      market:
        parsed.market && typeof parsed.market === "object"
          ? {
              question:
                typeof parsed.market.question === "string"
                  ? parsed.market.question.slice(0, 200)
                  : "Market loading...",
              coin:
                typeof parsed.market.coin === "string"
                  ? parsed.market.coin
                  : "ETH",
              yesPrice:
                typeof parsed.market.yesPrice === "number"
                  ? Math.max(0, Math.min(1, parsed.market.yesPrice))
                  : 0.5,
            }
          : null,
    };

    return Response.json(response);
  } catch (err) {
    console.error("Agent API error:", err);

    return Response.json(
      {
        message: "FTSO feed glitch... stand by",
        mood: "neutral",
        confidence: 0.5,
      },
      { status: 500 }
    );
  }
}
