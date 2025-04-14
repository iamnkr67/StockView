import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const StockGraph = ({ symbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#000000", // Black text color
      },
      grid: {
        vertLines: { color: "#e0e0e0" },
        horzLines: { color: "#e0e0e0" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        fixLeftEdge: true,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },

      crosshair: {
        mode: 0, // Follow the mouse over the chart
      },
      rightPriceScale: {
        borderColor: "#d1d4dc", // Add a border to the right price scale to make it more visible
      },
    });

    chartRef.current = chart;

    try {
      seriesRef.current = chart.addCandlestickSeries({
        upColor: "#69a79c",
        borderUpColor: "#4fff00",
        wickUpColor: "#69a79c",
        downColor: "#ff0000",
        borderDownColor: "#ff0000",
        wickDownColor: "#FF0000",
      }); // ✅ v3
    } catch (err) {
      console.error("addLineSeries failed:", err);
    }
    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!symbol || !seriesRef.current) return;

    fetch(`http://localhost:3001/stock/graph/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        
        seriesRef.current.setData(data);
        chartRef.current.timeScale().fitContent(); //
        chartRef.current.timeScale().scrollToPosition(0, false); // Scroll to the latest data point
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [symbol]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
  );
};
export default StockGraph;
