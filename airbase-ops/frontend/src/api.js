/**
 * API layer for AirBase Ops.
 *
 * Hardened with:
 * - AbortController timeout (8s default, 20s for AI)
 * - 1-retry with backoff on network failure
 * - Descriptive error parsing from HTTP responses
 */

const BASE_URL = '/api';

/**
 * Fetch wrapper with timeout and retry.
 * @param {string} url
 * @param {RequestInit} opts
 * @param {number} timeoutMs — abort after this many ms
 * @param {number} retries — number of retries on network error
 */
async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        // Try to parse error detail from FastAPI
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          if (body.detail) detail = body.detail;
        } catch { /* ignore parse error */ }
        throw new Error(detail);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timer);

      // If aborted, give clear message
      if (err.name === 'AbortError') {
        throw new Error('Request timed out — server may be busy');
      }

      // Retry on network errors only (not HTTP errors)
      if (attempt < retries && err.message?.includes('fetch')) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1))); // backoff
        continue;
      }

      throw err;
    }
  }
}

// --- Standard game endpoints ---

export async function getState() {
  try {
    return await fetchWithTimeout(`${BASE_URL}/state`);
  } catch {
    return null;
  }
}

export async function startGame() {
  return fetchWithTimeout(`${BASE_URL}/start-game`, { method: 'POST' });
}

export async function advanceTurn() {
  return fetchWithTimeout(`${BASE_URL}/advance-turn`, { method: 'POST' });
}

export async function advanceMultiple(turns) {
  return fetchWithTimeout(`${BASE_URL}/advance-multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turns }),
  });
}

export async function assignAircraft(missionId, aircraftIds) {
  return fetchWithTimeout(`${BASE_URL}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_ids: aircraftIds }),
  });
}

export async function unassignAircraft(missionId, aircraftId) {
  return fetchWithTimeout(`${BASE_URL}/unassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_id: aircraftId }),
  });
}

export async function planMission(missionId) {
  return fetchWithTimeout(`${BASE_URL}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId }),
  });
}

export async function prepAircraft(aircraftId) {
  return fetchWithTimeout(`${BASE_URL}/prep-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId }),
  });
}

export async function armAircraft(aircraftId, missiles, bombs, pods) {
  return fetchWithTimeout(`${BASE_URL}/arm-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId, missiles, bombs, pods }),
  });
}

// --- AI endpoints (longer timeout — LLM calls take time) ---

export async function aiSuggest() {
  return fetchWithTimeout(`${BASE_URL}/ai/suggest`, { method: 'POST' }, 20000);
}

export async function aiRecommend() {
  return fetchWithTimeout(`${BASE_URL}/ai/recommend`, { method: 'POST' }, 20000);
}

export async function aiChat(message) {
  return fetchWithTimeout(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  }, 20000);
}

// --- Metrics & Compare ---

export async function getMetrics() {
  return fetchWithTimeout(`${BASE_URL}/metrics`);
}

export async function getCompare() {
  // Compare runs AI + 2 simulations — give it 25s
  return fetchWithTimeout(`${BASE_URL}/compare`, { method: 'POST' }, 25000);
}

// --- Save / Load ---

export async function saveGame() {
  return fetchWithTimeout(`${BASE_URL}/save`, { method: 'POST' });
}

export async function loadGame() {
  return fetchWithTimeout(`${BASE_URL}/load`, { method: 'POST' });
}
