"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import {
  FLARE_RPC_URL,
  CONTRACT_ADDRESS,
  HEDGE_PRICE_ABI,
  PRICE_POLL_INTERVAL,
} from "../config/flare";

const MAX_HISTORY = 20;

export default function useFlarePrice() {
  const [allPrices, setAllPrices] = useState({});
  const [ethPrice, setEthPrice] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const providerRef = useRef(null);
  const contractRef = useRef(null);

  // Initialize provider and contract once
  useEffect(() => {
    try {
      providerRef.current = new ethers.JsonRpcProvider(FLARE_RPC_URL);
      contractRef.current = new ethers.Contract(
        CONTRACT_ADDRESS,
        HEDGE_PRICE_ABI,
        providerRef.current
      );
    } catch (err) {
      setError("Failed to connect to Flare: " + err.message);
      setLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    if (!contractRef.current) return;

    try {
      const [symbols, prices, decimals, timestamp] =
        await contractRef.current.getAllPrices();

      const parsed = {};
      let ethVal = null;

      for (let i = 0; i < symbols.length; i++) {
        const dec = Number(decimals[i]);
        const raw = Number(prices[i]);
        const value = raw / Math.pow(10, Math.abs(dec));
        parsed[symbols[i]] = value;

        if (symbols[i] === "ETH/USD") {
          ethVal = value;
        }
      }

      const feedTimestamp = new Date(Number(timestamp) * 1000);

      setAllPrices(parsed);
      setEthPrice(ethVal);
      setLastUpdated(feedTimestamp);
      setError(null);
      setLoading(false);

      if (ethVal !== null) {
        setPriceHistory((prev) => {
          const updated = [...prev, { price: ethVal, timestamp: feedTimestamp }];
          return updated.slice(-MAX_HISTORY);
        });
      }
    } catch (err) {
      console.error("FTSO fetch error:", err);
      setError("Failed to fetch prices: " + err.message);
      if (ethPrice === null) setLoading(false);
    }
  }, [ethPrice]);

  // Poll for price updates
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Compute trend from ETH history
  const trend =
    priceHistory.length >= 2
      ? priceHistory[priceHistory.length - 1].price -
        priceHistory[priceHistory.length - 2].price
      : 0;

  const changePercent =
    priceHistory.length >= 2 && priceHistory[0].price > 0
      ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) /
          priceHistory[0].price) *
        100
      : 0;

  return {
    allPrices,
    ethPrice,
    priceHistory,
    trend,
    changePercent,
    loading,
    error,
    lastUpdated,
  };
}
