import { useState, useCallback, useEffect, useRef } from 'react';
import * as api from '../api';

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);

  // Previous metrics for delta tracking
  const prevMetricsRef = useRef(null);
  const [prevMetrics, setPrevMetrics] = useState(null);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch metrics whenever game state changes
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await api.getMetrics();
      // Store previous metrics before updating
      setPrevMetrics(prevMetricsRef.current);
      prevMetricsRef.current = data;
      setMetrics(data);
    } catch {
      // Metrics are non-critical — silently ignore
    }
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      setGameState(data);
      if (data) fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.startGame();
      setGameState(data);
      setError(null);
      setComparison(null);
      setRecommendations(null);
      prevMetricsRef.current = null;
      setPrevMetrics(null);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const advanceTurn = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.advanceTurn();
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const advanceMultiple = useCallback(async (turns) => {
    setLoading(true);
    try {
      const data = await api.advanceMultiple(turns);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const assignAircraft = useCallback(async (missionId, aircraftIds) => {
    try {
      const data = await api.assignAircraft(missionId, aircraftIds);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const unassignAircraft = useCallback(async (missionId, aircraftId) => {
    try {
      const data = await api.unassignAircraft(missionId, aircraftId);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const planMission = useCallback(async (missionId) => {
    try {
      const data = await api.planMission(missionId);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const prepAircraft = useCallback(async (aircraftId) => {
    try {
      const data = await api.prepAircraft(aircraftId);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const armAircraftAction = useCallback(async (aircraftId, missiles, bombs, pods) => {
    try {
      const data = await api.armAircraft(aircraftId, missiles, bombs, pods);
      setGameState(data);
      fetchMetrics();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchMetrics]);

  const aiSuggest = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.aiSuggest();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const aiChatSend = useCallback(async (message) => {
    try {
      const result = await api.aiChat(message);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // --- NEW: Compare Mode ---
  const fetchCompare = useCallback(async () => {
    setCompareLoading(true);
    try {
      const data = await api.getCompare();
      setComparison(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCompareLoading(false);
    }
  }, []);

  // --- NEW: AI Recommendations ---
  const fetchRecommendations = useCallback(async () => {
    setRecsLoading(true);
    try {
      const data = await api.aiRecommend();
      setRecommendations(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setRecsLoading(false);
    }
  }, []);

  return {
    gameState,
    loading,
    error,
    metrics,
    prevMetrics,
    comparison,
    compareLoading,
    recommendations,
    recsLoading,
    fetchState,
    startGame,
    advanceTurn,
    advanceMultiple,
    assignAircraft,
    unassignAircraft,
    planMission,
    prepAircraft,
    armAircraft: armAircraftAction,
    aiSuggest,
    aiChatSend,
    fetchCompare,
    fetchRecommendations,
    fetchMetrics,
  };
}
