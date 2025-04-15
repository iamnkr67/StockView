import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStock } from "../context/StockContext.jsx";
import { IoMdRefresh, IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import axios from "axios";
import StockGraph from "../components/StockGraph.jsx";

const API_BASE = "https://stockviewback.onrender.com";

const StockDetails = () => {
  const { selectedStock } = useStock();
  const { id } = useParams();
  const navigate = useNavigate();

  const [stock, setStock] = useState(selectedStock || null);
  const [price, setPrice] = useState(null);
  const [targetPrice, setTargetPrice] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/stock/wishlist/${user.email}`);
      setWishlist(res.data);
      const exists = res.data.find((item) => item.stockId === id);
      setIsWishlisted(!!exists);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  }, [user?.email, id]);

  const fetchStockData = useCallback(async () => {
    let currentStock = stock;

    if (!currentStock || currentStock["Security Id"] !== id) {
      const res = await fetch("/stock.json");
      const data = await res.json();
      currentStock = data.find((s) => s["Security Id"] === id);
      if (currentStock) setStock(currentStock);
    }

    if (currentStock) {
      try {
        const res = await fetch(`${API_BASE}/stock/${id}`);
        const data = await res.json();
        setPrice(data.priceInfo.lastPrice);
      } catch (err) {
        console.error("Failed to fetch stock price:", err);
      }
    }
  }, [id, stock]);

  useEffect(() => {
    fetchStockData();
    fetchWishlist();
  }, [fetchStockData, fetchWishlist]);

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
      } else {
        await axios.post(`${API_BASE}/stock/wishlist`, data);
      }
      await fetchWishlist(); // Automatically updates list + heart icon
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const savePrice = () => {
    if (!user || !stock) return;

    const alertData = {
      stockId: id,
      stockName: stock["Issuer Name"],
      targetPrice,
      stopLoss,
    };

    axios
      .post(`${API_BASE}/stock/alert`, {
        name: user.name,
        email: user.email,
        stock: alertData,
      })
      .then((response) => alert(response.data.message))
      .catch((error) => {
        alert(error.response?.data?.message || "Failed to set alert.");
      });
  };

  if (!stock) return <p>Loading stock details...</p>;

  return (
    <>
      <div className="flex justify-between items-center mt-4 px-6">
        <h2 className="text-xl font-bold text-secondary text-center flex items-baseline gap-2">
          {stock["Issuer Name"]}
          <span className="text-sm text-gray-500">{stock["Instrument"]}</span>
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition"
          >
            My Wishlist
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {wishlist.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  Wishlist is empty
                </p>
              ) : (
                <ul>
                  {wishlist.map((item) => (
                    <li
                      key={item.stockId}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(`/stock/${item.stockId}`);
                      }}
                    >
                      {item.stockName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-transparent rounded-lg shadow-md mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{stock["Security Id"]}</h2>
              <p className="text-sm mb-2">{stock["Industry New Name"]}</p>
            </div>
            <button
              onClick={toggleWishlist}
              className="text-2xl text-green-800"
            >
              {isWishlisted ? <IoMdHeart /> : <IoMdHeartEmpty />}
            </button>
          </div>

          <div className="my-4">
            <StockGraph symbol={stock["Security Id"]} />
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-secondary">Create Alert</h2>
          <p className="text-sm text-gray-500 mb-6">
            Email notification will be sent when your target is crossed.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Price
            </label>
            <input
              type="number"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={price !== null ? `₹ ${price}` : "Loading..."}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
              />
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  fetch(`${API_BASE}/stock/${id}`)
                    .then((res) => res.json())
                    .then((data) => setPrice(data.priceInfo.lastPrice))
                    .catch((err) =>
                      console.error("Failed to refresh price: ", err),
                    )
                    .finally(() =>
                      setTimeout(() => setIsRefreshing(false), 1000),
                    );
                }}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              >
                <IoMdRefresh
                  className={`${isRefreshing ? "animate-spin" : ""} text-xl`}
                />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stop Loss
            </label>
            <input
              type="number"
              placeholder="Enter stop loss"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <button
            onClick={savePrice}
            className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-secondary-dark transition"
          >
            Set Alert
          </button>
        </div>
      </div>
    </>
  );
};

export default StockDetails;
