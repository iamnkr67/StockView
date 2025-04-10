import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useStock } from "../context/StockContext.jsx";
import { IoMdRefresh } from "react-icons/io";

const StockDetails = () => {
  const { selectedStock } = useStock();
  const { id } = useParams();
  const [stock,setStock] = useState(selectedStock || null);
  const [price, setPrice] = useState(null);
  

  useEffect(() => {
    if (!stock || stock["Security Id"] !== id) {
      fetch("/stock.json").then((res) => res.json()).then((data) => {
        const foundStock = data.find((stock)=> stock["Security Id"] === id);
        if (foundStock) {
          setStock(foundStock);
        } else {
          console.error("Stock not found");
        }
      })
    }

    fetch(`http://localhost:3001/stock/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setPrice(data.priceInfo.lastPrice);
      })
      .catch((err) => console.error("Failed to fetch stock details: ", err));
  }, [id, stock]);
  
   if (!stock) {
     return <p>Loading stock details...</p>;
   }

  return (
    <>
      <h2 className="text-xl font-bold text-secondary text-center mt-4"> {stock["Issuer Name"]} </h2>
      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Graph Section */}
        <div className="flex-1 bg-gray-100 rounded-lg shadow-md mt-4 p-4">
          <h2 className="text-lg font-bold ">{stock["Security Id"]}</h2>
          <p className="text-sm mb-4">{stock["Industry New Name"]}</p>
          <p className="text-gray-500">
            Graph will be displayed here in the future.
          </p>
        </div>

        {/* Create Alert Section */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold  text-secondary">Create Alert</h2>
          <p className="text-sm text-gray-500 mb-6">
            An email notification will be sent when your target is crossed.
          </p>

          {/* Target Price Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Price
            </label>
            <input
              type="number"
              placeholder="Enter target price"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Current Price Display */}
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
                  // Fetch the price again
                  fetch(`http://localhost:3001/stock/${id}`)
                    .then((res) => {
                      if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                      }
                      return res.json();
                    })
                    .then((data) => {
                      console.log("Price refreshed:", data);
                      setPrice(data.priceInfo.lastPrice); // Update the price
                    })
                    .catch((err) =>
                      console.error("Failed to refresh price: ", err)
                    );
                }}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              >
                <IoMdRefresh />
              </button>
            </div>
          </div>

          {/* Stop Loss Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stop Loss
            </label>
            <input
              type="number"
              placeholder="Enter stop loss"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Set Alert Button */}
          <button className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-secondary-dark transition">
            Set Alert
          </button>
        </div>
      </div>
    </>
  );
};

export default StockDetails;
