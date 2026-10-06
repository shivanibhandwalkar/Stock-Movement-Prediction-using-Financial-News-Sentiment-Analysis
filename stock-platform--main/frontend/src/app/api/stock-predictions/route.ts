import { NextResponse } from "next/server";

export const maxDuration = 300; // first analysis is slow

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = (searchParams.get("symbols") || "AAPL")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 3); // protects the free API quotas

  const predictions: any[] = [];

  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `${BACKEND}/full-analysis/${encodeURIComponent(symbol)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const d = await res.json();

      predictions.push({
        symbol,
        signal: d.signal,
        sentimentScore: d.sentiment_score,
        predictedPrice: d.forecast?.predicted_price,
        expectedReturn: d.forecast?.expected_return,
        riskLevel: d.risk?.level,
        volatility: d.risk?.volatility,
        var95: d.risk?.var_95,
        mcExpected: d.monte_carlo?.expected_price_30d,
        mcWorst: d.monte_carlo?.worst_case_5pct,
        mcBest: d.monte_carlo?.best_case_95pct,
      });
    } catch (e: any) {
      predictions.push({
        symbol,
        error: e?.message || "Backend not reachable. Is it running on port 8000?",
      });
    }
  }

  return NextResponse.json({ predictions });
}