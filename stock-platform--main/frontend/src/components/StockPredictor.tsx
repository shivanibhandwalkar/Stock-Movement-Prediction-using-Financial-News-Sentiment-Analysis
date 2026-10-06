"use client";

import { useState } from "react";

const pct = (v: any, d = 2) =>
  typeof v === "number" ? `${(v * 100).toFixed(d)}%` : "-";
const usd = (v: any) => (typeof v === "number" ? `$${v.toFixed(2)}` : "-");

const signalColor = (s: string) =>
  s === "BUY"
    ? "bg-green-500/20 text-green-400"
    : s === "SELL"
    ? "bg-red-500/20 text-red-400"
    : "bg-yellow-500/20 text-yellow-400";

export default function StockPredictor() {
  const [symbol, setSymbol] = useState("AAPL");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `/api/stock-predictions?symbols=${encodeURIComponent(symbol)}`
      );
      const data = await res.json();
      setResults(data.predictions ?? []);
    } catch {
      setResults([{ symbol, error: "Request failed" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-1">AI Stock Prediction</h2>
      <p className="text-xs text-gray-400 mb-4">
        FinBERT sentiment + LSTM forecast + Monte Carlo risk (Python backend)
      </p>

      <div className="flex gap-3 mb-4">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker (e.g. AAPL)"
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white w-40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button
          onClick={run}
          disabled={loading || !symbol}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium disabled:opacity-50"
        >
          {loading ? "Analyzing... (can take a minute)" : "Get Prediction"}
        </button>
      </div>

      {results.map((r) =>
        r.error ? (
          <div key={r.symbol} className="p-4 rounded-lg bg-red-900/30 text-red-300 text-sm">
            {r.symbol}: {r.error}
          </div>
        ) : (
          <div key={r.symbol} className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-white">{r.symbol}</div>
              <div className={`px-4 py-1 rounded-full font-semibold ${signalColor(r.signal)}`}>
                {r.signal}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Item label="Predicted price" value={usd(r.predictedPrice)} />
              <Item label="Expected return" value={pct(r.expectedReturn)} />
              <Item label="News sentiment" value={r.sentimentScore?.toFixed?.(3) ?? "-"} />
              <Item label="Risk level" value={r.riskLevel ?? "-"} />
              <Item label="Volatility" value={pct(r.volatility)} />
              <Item label="VaR (95%)" value={pct(r.var95)} />
              <Item label="30-day expected" value={usd(r.mcExpected)} />
              <Item label="Worst case (5%)" value={usd(r.mcWorst)} />
              <Item label="Best case (95%)" value={usd(r.mcBest)} />
            </div>
          </div>
        )
      )}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}