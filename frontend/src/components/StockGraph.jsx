import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StockGraph = ({ stockData, companyName }) => {
  if (!stockData || stockData.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">
        {companyName} Stock Trend
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={stockData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockGraph;
