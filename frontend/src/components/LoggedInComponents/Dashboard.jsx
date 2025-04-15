// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [prices, setPrices] = useState({});
  const [previousPrices, setPreviousPrices] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/stock.json")
      .then((res) => res.json())
      .then((data) => {
        // Filter the stocks to include only PAYTM, ADANIENT, SWIGGY, NDTV, IDEA, AHLUCONT
        const filtered = data.filter((stock) =>
          ["PAYTM", "ADANIENT", "SWIGGY", "NDTV", "IDEA", "AHLUCONT"].includes(
            stock["Security Id"],
          ),
        );

        setStocks(filtered);

        // Fetch prices for each filtered stock
        const pricePromises = filtered.map((stock) =>
          fetch(`http://localhost:3001/stock/${stock["Security Id"]}`)
            .then((res) => res.json())
            .then((priceData) => ({
              id: stock["Security Id"],
              price: priceData.priceInfo.lastPrice,
            }))
            .catch((err) => {
              console.error(
                "Error fetching price for",
                stock["Security Id"],
                err,
              );
              return null;
            }),
        );

        Promise.all(pricePromises).then((results) => {
          const newPrices = {};
          results.forEach((item) => {
            if (item) {
              newPrices[item.id] = item.price;
            }
          });

          setPrices(newPrices);

          // Save previous prices for calculating the difference
          setPreviousPrices(newPrices);
        });
      });
  }, []);

  const handleClick = (stockId) => {
    navigate(`/stock/${stockId}`);
  };

  // Function to calculate price change
  const getPriceChangeClass = (currentPrice, previousPrice) => {
    if (currentPrice > previousPrice) {
      return {
        className: "text-green-600",
        change: `+${(currentPrice - previousPrice).toFixed(2)}`,
      };
    } else if (currentPrice < previousPrice) {
      return {
        className: "text-red-600",
        change: `-${(previousPrice - currentPrice).toFixed(2)}`,
      };
    }
    return { className: "text-gray-600", change: "" };
  };

  return (
    <div className="p-8 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => {
          const currentPrice = prices[stock["Security Id"]];
          const previousPrice = previousPrices[stock["Security Id"]];
          const { className, change } = getPriceChangeClass(
            currentPrice,
            previousPrice,
          );

          return (
            <div
              key={stock["Security Id"]}
              onClick={() => handleClick(stock["Security Id"])}
              className="cursor-pointer bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition duration-300 hover:scale-105"
            >
              <h2 className="text-xl font-semibold text-secondary mb-2">
                {stock["Issuer Name"]}
              </h2>
              <p className="text-sm text-gray-600">
                {stock["Industry New Name"]}
              </p>
              <p className="mt-4 text-lg font-bold">
                ₹ {currentPrice !== undefined ? currentPrice : "Loading..."}
                <span className={`ml-2 ${className}`}>{change}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
