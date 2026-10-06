import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("🚀 Next.js API route triggered!");
  
  try {
    const url = new URL(req.url);
    const symbolsParam = url.searchParams.get("symbols") || "AAPL,GOOGL,MSFT";
    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());

    const predictions = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          console.log(`⏳ Fetching Python backend for ${symbol}...`);
          
          const res = await fetch(`http://127.0.0.1:8000/full-analysis/${symbol}`, {
            cache: 'no-store'
          });
          
          if (!res.ok) {
            throw new Error(`Python backend returned status ${res.status}`);
          }
          
          const data = await res.json();
          console.log(`✅ Success for ${symbol}`);
          
          return {
            symbol: data.ticker || symbol,
            prediction: data.signal || "UNKNOWN",
            confidence: data.sentiment_score ? Math.min(Math.abs(data.sentiment_score) + 0.7, 0.99) : 0.85,
            raw: data 
          };
        } catch (err: any) {
          console.error(`❌ Fetch failed for ${symbol}:`, err.message);
          return {
            symbol,
            prediction: "ERROR",
            confidence: 0,
            error: err.message || "Failed to connect to backend"
          };
        }
      })
    );

    return NextResponse.json({ predictions });
  } catch (err: any) {
    console.error("🔥 FATAL API ERROR:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}