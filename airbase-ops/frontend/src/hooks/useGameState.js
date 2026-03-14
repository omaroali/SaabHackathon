import { useState, useCallback } from 'react';
import * as api from '../api';

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.startGame();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  const advanceTurn = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.advanceTurn();
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  const advanceMultiple = useCallback(async (turns) => {
    setLoading(true);
    try {
      const data = await api.advanceMultiple(turns);
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  const assignAircraft = useCallback(async (missionId, aircraftIds) => {
    try {
      const data = await api.assignAircraft(missionId, aircraftIds);
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const unassignAircraft = useCallback(async (missionId, aircraftId) => {
    try {
      const data = await api.unassignAircraft(missionId, aircraftId);
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const prepAircraft = useCallback(async (aircraftId) => {
    try {
      const data = await api.prepAircraft(aircraftId);
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const armAircraftAction = useCallback(async (aircraftId, missiles, bombs, pods) => {
    try {
      const data = await api.armAircraft(aircraftId, missiles, bombs, pods);
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const aiSuggest = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.aiSuggest();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
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

  return {
    gameState,
    loading,
    error,
    fetchState,
    startGame,
    advanceTurn,
    advanceMultiple,
    assignAircraft,
    unassignAircraft,
    prepAircraft,
    armAircraft: armAircraftAction,
    aiSuggest,
    aiChatSend,
  };
}
