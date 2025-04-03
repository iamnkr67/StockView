import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import StockGraph from "../components/StockGraph";
import AlertForm from "../components/AlertForm";

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 600000); 
    return () => clearInterval(interval);
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await axios.get("https://api.example.com/stocks");
      setStocks(response.data.slice(0, 4)); // Limiting to top 4 stocks
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  return (
    <section className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Stock Dashboard</h1>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading stocks...</p>
        ) : (
          stocks.map((stock, index) => (
            <motion.div
              key={index}
              onClick={() => setSelectedStock(stock)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-6 bg-white shadow-lg rounded-lg flex flex-col items-center justify-center cursor-pointer"
            >
              <img
                src={stock.image}
                alt={stock.name}
                className="w-16 h-16 mb-2"
              />
              <h2 className="text-xl font-bold">{stock.name}</h2>
              <p className="text-lg">Upper: {stock.upperLimit}</p>
              <p className="text-lg">Lower: {stock.lowerLimit}</p>
            </motion.div>
          ))
        )}
      </div>
      {selectedStock && <StockGraph stock={selectedStock} />}
      <AlertForm stocks={stockList} onSetAlert={handleAlert} />
    </section>
  );
};

export default Dashboard;
