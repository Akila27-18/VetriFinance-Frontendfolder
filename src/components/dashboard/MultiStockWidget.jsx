import { useEffect, useState, useRef } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

// Stock logos
const LOGOS = {
  GOOGL: "./logos/google.jpg",
  AMZN: "./logos/amzn.jpg",
  AAPL: "./logos/aapl.jpg",
  TSLA: "/logos/tsla.jpg",
  MSFT: "/logos/msft.jpg",
  "BTC-USD": "/logos/btc.jpg",
  "ETH-USD": "/logos/eth.jpg",
  "RELIANCE.NS": "/logos/reliance.jpg",
  "TCS.NS": "/logos/tcs.jpg",
  "HDFCBANK.NS": "/logos/hdfc.jpg",
};

function MultiStockWidget({ symbols }) {
  const [data, setData] = useState({});
  const [profitInput, setProfitInput] = useState({});
  const [dark, setDark] = useState(false);
  const containerRef = useRef(null);
  const cardHeight = 90; // Approximate height of one stock card
  const visibleCount = 4;

  const convert = (s) => {
    if (s.startsWith("NSE:")) return s.replace("NSE:", "") + ".NS";
    if (s.includes("USD")) return s.replace("USD", "-USD");
    return s;
  };

  const fetchStock = async (symbol) => {
    const sym = convert(symbol);
    const res = await fetch(`http://localhost:5000/api/stock/${sym}`);
    const json = await res.json();

    try {
      const result = json.chart.result[0];
      const prices = result.indicators.quote[0].close;

      const last = prices[prices.length - 1];
      const prev = prices[prices.length - 2];

      const change = last - prev;
      const percent = ((change / prev) * 100).toFixed(2);

      return {
        symbol: sym,
        price: last,
        change,
        percent,
        spark: prices.slice(-20),
      };
    } catch {
      return null;
    }
  };

  const loadAll = async () => {
    const output = {};
    for (const s of symbols) {
      output[s] = await fetchStock(s);
    }
    setData(output);
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`p-4 rounded-xl shadow ${
        dark ? "bg-black text-orange-400" : "bg-white text-orange-500"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">📈 Live Market Updates</h2>
        <button
          onClick={() => setDark(!dark)}
          className="px-2 py-1 text-sm rounded bg-gray-300"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      {/* Scrollable stock list */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight: `${cardHeight * visibleCount}px` }}
      >
        {symbols.map((symbol) => {
          const stock = data[symbol];
          if (!stock)
            return (
              <div key={symbol} className="text-gray-400 py-2">
                Loading {symbol}...
              </div>
            );

          const up = stock.change > 0;

          return (
            <div
              key={symbol}
              className="p-3 flex justify-between border-b last:border-none"
            >
              <img
                src={LOGOS[stock.symbol]}
                alt=""
                className="w-10 h-10 rounded-full mr-3"
              />

              <div className="flex-1">
                <div className="font-semibold">{stock.symbol}</div>
                <div className="text-sm">
                  <span className="font-bold">${stock.price.toFixed(2)}</span>
                  <span
                    className={`ml-2 font-medium ${
                      up ? "text-green-500" : "text-red-500"
                    } animate-pulse`}
                  >
                    {up ? "▲" : "▼"} {stock.percent}%
                  </span>
                </div>

                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="w-16 text-black p-1 rounded text-xs"
                    onChange={(e) =>
                      setProfitInput({
                        ...profitInput,
                        [symbol]: e.target.value,
                      })
                    }
                  />

                  {profitInput[symbol] && (
                    <div className="text-xs">
                      💰 P/L:{" "}
                      <span className={up ? "text-green-400" : "text-red-400"}>
                        {(profitInput[symbol] * stock.change).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-28 h-10">
                <Sparklines data={stock.spark}>
                  <SparklinesLine
                    color={up ? "green" : "red"}
                    style={{ fill: "none", strokeWidth: 2 }}
                  />
                </Sparklines>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MultiStockWidget;
