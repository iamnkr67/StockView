import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useStock } from "../context/StockContext.jsx";
import { IoMdRefresh, IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { LuZoomIn } from "react-icons/lu";
import { ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import StockGraph from "../components/StockGraph.jsx";
import { Alert } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const API_BASE = "https://stockviewback.onrender.com";

const StockDetails = () => {
  const { selectedStock } = useStock();
  const { id } = useParams();
  const [stock, setStock] = useState(selectedStock || null);
  const [price, setPrice] = useState(null);
  const [changeRate, setChangeRate] = useState(null);
  const [changePercent, setChangePercent] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/stock/wishlist/${user.email}`);
      setWishlist(res.data);
      setIsWishlisted(res.data.some((item) => item.stockId === id));
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, [user?.email, id]);

  const fetchAlerts = useCallback(async () => {
    if (!user || !id) return;
    try {
      const res = await axios.get(`${API_BASE}/stock/alert/${user.email}`);
      setAlerts(res.data.filter((a) => a.stockId === id));
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  }, [user?.email, id]);

  const fetchStockData = useCallback(async () => {
    try {
      let currentStock = stock;
      if (!currentStock || currentStock["Security Id"] !== id) {
        const res = await fetch("/stock.json");
        const data = await res.json();
        currentStock = data.find((s) => s["Security Id"] === id);
        if (currentStock) setStock(currentStock);
      }

      if (!currentStock) return;

      const res = await fetch(`${API_BASE}/stock/${id}`);
      const data = await res.json();
      const priceInfo = data?.priceInfo;

      if (
        priceInfo?.lastPrice &&
        (priceInfo.lastPrice !== price ||
          priceInfo.change !== changeRate ||
          priceInfo.pChange !== changePercent)
      ) {
        setPrice(priceInfo.lastPrice);
        setChangeRate(priceInfo.change);
        setChangePercent(priceInfo.pChange);
      }
    } catch (err) {
      console.error("Failed to fetch stock data:", err);
    }
  }, [id, stock, price, changeRate, changePercent]);

  useEffect(() => {
    fetchStockData();
    fetchWishlist();
    fetchAlerts();
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, [fetchStockData, fetchWishlist, fetchAlerts]);

  const toggleWishlist = async () => {
    if (!user || !stock) return;
    const data = {
      email: user.email,
      stock: {
        stockId: id,
        stockName: stock["Issuer Name"],
      },
    };
    try {
      if (isWishlisted) {
        await axios.delete(`${API_BASE}/stock/wishlist/${user.email}/${id}`);
        showAlert("Removed from wishlist");
      } else {
        await axios.post(`${API_BASE}/stock/wishlist`, data);
        showAlert("Added to wishlist");
      }
      fetchWishlist();
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const savePrice = async () => {
    if (!user || !stock) return;
    try {
      await axios.post(`${API_BASE}/stock/alert`, {
        name: user.name,
        email: user.email,
        stock: {
          stockId: id,
          stockName: stock["Issuer Name"],
          targetPrice: parseFloat(targetPrice),
          stopLoss: parseFloat(stopLoss),
        },
      });
      showAlert("Price alert is created");
      setTargetPrice("");
      setStopLoss("");
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set alert.");
    }
  };

  const refreshPrice = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/stock/${id}`);
      const data = await res.json();
      if (data?.priceInfo?.lastPrice) {
        setPrice(data.priceInfo.lastPrice);
        setChangeRate(data.priceInfo.change);
        setChangePercent(data.priceInfo.pChange);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  if (!stock) {
    return (
      <p className="text-center text-gray-500 p-8">Loading stock details...</p>
    );
  }

  return (
    <>
      {alertMessage && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
            {alertMessage}
          </Alert>
        </div>
      )}

      <h2 className="text-2xl font-bold text-secondary m-7">
        {stock["Issuer Name"]}{" "}
        <span className="text-sm text-gray-500">{stock["Instrument"]}</span>
      </h2>

      <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="bg-white rounded-lg shadow-md p-4 w-full lg:w-3/4 relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">{stock["Security Id"]}</h2>
              <p className="text-sm text-gray-500">
                {stock["Industry New Name"]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleWishlist}
                className="text-2xl text-green-700"
              >
                {isWishlisted ? <IoMdHeart /> : <IoMdHeartEmpty />}
              </button>
              {price !== null ? (
                <>
                  <span className="text-sm font-medium text-gray-600">₹</span>
                  <span className="text-md font-semibold text-gray-700">
                    {price}
                  </span>
                  <span
                    className={`inline-flex items-center text-md font-semibold ${
                      changeRate > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {changeRate > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>
                      {changeRate > 0
                        ? `+${changeRate.toFixed(2)}`
                        : changeRate.toFixed(2)}
                    </span>
                    <span>({Math.abs(changePercent).toFixed(2)}%)</span>
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-gray-400">
                  ₹{" "}
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="text-xl animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      .
                    </span>
                  ))}
                </span>
              )}
              <button onClick={refreshPrice} className="text-gray-600">
                <IoMdRefresh
                  className={`${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="w-full h-[400px]">
            <StockGraph symbol={stock["Security Id"]} />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="text-xl bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
              title="Zoom Chart"
            >
              <LuZoomIn />
            </button>
          </div>

          {alerts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-secondary mb-2">
                Price Alerts
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {alerts.map((alert, idx) => (
                  <li key={idx}>
                    Target: ₹{alert.targetPrice} | Stop Loss: ₹{alert.stopLoss}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-1/4">
          <h2 className="text-xl font-bold text-secondary mb-4">
            Create Alert
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Target Price
          </label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Price
          </label>
          <div className="w-full mb-4 px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 h-[42px] flex items-center">
            {price !== null ? (
              <span>₹ {price}</span>
            ) : (
              <span className="flex items-center gap-1">
                ₹{" "}
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className="text-xl animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    .
                  </span>
                ))}
              </span>
            )}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stop Loss
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            onClick={savePrice}
            className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-secondary-dark transition"
          >
            Set Alert
          </button>
        </div>
      </div>

      {isZoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full relative">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-2 right-2 text-xl text-gray-600"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-secondary">
              {stock["Issuer Name"]}
            </h2>
            <StockGraph symbol={stock["Security Id"]} />
          </div>
        </div>
      )}
    </>
  );
};

export default StockDetails;
