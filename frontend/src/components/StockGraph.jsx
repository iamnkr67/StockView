import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { MutatingDots } from "react-loader-spinner";

const StockGraph = ({ symbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: "transparent",
        textColor: "#000000",
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
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "#d1d4dc",
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
      });
    } catch (err) {
      console.error("addCandlestickSeries failed:", err);
    }

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!symbol || !seriesRef.current) return;

    setIsLoading(true);

    fetch(`https://stockviewback.onrender.com/stock/graph/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        seriesRef.current.setData(data);
        chartRef.current.timeScale().fitContent();
        chartRef.current.timeScale().scrollToPosition(0, false);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, [symbol]);

  return (
    <div className="relative w-full h-[400px]">
      <div ref={chartContainerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-20">
          <MutatingDots
            height="100"
            width="100"
            color="#69A79C"
            secondaryColor="red"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            visible={true}
          />
        </div>
      )}

      <div className="absolute bottom-7 left-0 mb-4 mr-4 z-10">
        <span className="text-gray-300 text-sm opacity-80 bg-opacity-50 p-2 rounded  hover:text-black">
          ©{" "}
          <a
            href="https://www.tradingview.com/lightweight-charts/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-300 hover:text-black"
          >
            TradingView Lightweight Charts
          </a>
        </span>
      </div>
    </div>
  );
};

export default StockGraph;
