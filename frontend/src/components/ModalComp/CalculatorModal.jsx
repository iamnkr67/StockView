import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const CalculatorModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("trade");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [sipReturn, setSipReturn] = useState("");
  const [sipDuration, setSipDuration] = useState("");
  const [ipoPrice, setIpoPrice] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [result, setResult] = useState(null);
  const [isProfit, setIsProfit] = useState(null);

  useEffect(() => {
    if (mode === "trade") {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseFloat(quantity);
      if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty)) {
        const pnl = (exit - entry) * qty;
        setResult(pnl.toFixed(2));
        setIsProfit(pnl >= 0);
      } else {
        setResult(null);
      }
    } else if (mode === "sip") {
      const amount = parseFloat(sipAmount);
      const rate = parseFloat(sipReturn) / 100 / 12;
      const duration = parseInt(sipDuration);

      if (!isNaN(amount) && !isNaN(rate) && !isNaN(duration)) {
        const futureValue =
          (amount * ((Math.pow(1 + rate, duration) - 1) * (1 + rate))) / rate;
        setResult(futureValue.toFixed(2));
        setIsProfit(null);
      } else {
        setResult(null);
      }
    } else if (mode === "ipo") {
      const ipo = parseFloat(ipoPrice);
      const listing = parseFloat(listingPrice);
      const qty = parseFloat(quantity);

      // Ensure all inputs are numbers and not NaN
      if (!isNaN(ipo) && !isNaN(listing) && !isNaN(qty)) {
        const pnl = (listing - ipo) * qty;
        setResult(pnl.toFixed(2));
        setIsProfit(pnl >= 0);
      } else {
        setResult(null);
      }
    }
  }, [
    entryPrice,
    exitPrice,
    quantity,
    sipAmount,
    sipReturn,
    sipDuration,
    ipoPrice,
    listingPrice,
    mode,
  ]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 ease-out transform">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {mode === "trade"
                ? "Trade Calculator"
                : mode === "sip"
                ? "SIP Calculator"
                : "IPO Return Calculator"}
            </Dialog.Title>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setMode("trade")}
              className={`px-4 py-1 rounded-full border transition-all ${
                mode === "trade"
                  ? "bg-secondary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => setMode("sip")}
              className={`px-4 py-1 rounded-full border transition-all ${
                mode === "sip"
                  ? "bg-secondary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              SIP
            </button>
            <button
              onClick={() => setMode("ipo")}
              className={`px-4 py-1 rounded-full border transition-all ${
                mode === "ipo"
                  ? "bg-secondary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              IPO
            </button>
          </div>

          {mode === "trade" && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Entry Price</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Exit Price</label>
                <input
                  type="number"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}

          {mode === "sip" && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">
                  Monthly Investment (₹)
                </label>
                <input
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  value={sipReturn}
                  onChange={(e) => setSipReturn(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">
                  Investment Duration (months)
                </label>
                <input
                  type="number"
                  value={sipDuration}
                  onChange={(e) => setSipDuration(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}

          {mode === "ipo" && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">IPO Price</label>
                <input
                  type="number"
                  value={ipoPrice}
                  onChange={(e) => setIpoPrice(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Listing Price</label>
                <input
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}

          {result && (
            <div
              className={`mt-6 text-lg font-semibold text-center ${
                isProfit === null
                  ? "text-secondary"
                  : isProfit
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {isProfit === null
                ? "Expected Value: "
                : isProfit
                ? "Profit"
                : "Loss"}
              : ₹{result}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CalculatorModal;
