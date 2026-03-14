const BASE_URL = '/api';

export async function getState() {
  const res = await fetch(`${BASE_URL}/state`);
  if (!res.ok) return null;
  return res.json();
}

export async function startGame() {
  const res = await fetch(`${BASE_URL}/start-game`, { method: 'POST' });
  return res.json();
}

export async function advanceTurn() {
  const res = await fetch(`${BASE_URL}/advance-turn`, { method: 'POST' });
  return res.json();
}

export async function advanceMultiple(turns) {
  const res = await fetch(`${BASE_URL}/advance-multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turns })
  });
  return res.json();
}

export async function assignAircraft(missionId, aircraftIds) {
  const res = await fetch(`${BASE_URL}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_ids: aircraftIds })
  });
  return res.json();
}

export async function unassignAircraft(missionId, aircraftId) {
  const res = await fetch(`${BASE_URL}/unassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_id: aircraftId })
  });
  return res.json();
}

export async function prepAircraft(aircraftId) {
  const res = await fetch(`${BASE_URL}/prep-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId })
  });
  return res.json();
}

export async function armAircraft(aircraftId, missiles, bombs, pods) {
  const res = await fetch(`${BASE_URL}/arm-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId, missiles, bombs, pods })
  });
  return res.json();
}

export async function aiSuggest() {
  const res = await fetch(`${BASE_URL}/ai/suggest`, { method: 'POST' });
  return res.json();
}

export async function aiChat(message) {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}

export async function saveGame() {
  const res = await fetch(`${BASE_URL}/save`, { method: 'POST' });
  return res.json();
}

export async function loadGame() {
  const res = await fetch(`${BASE_URL}/load`, { method: 'POST' });
  return res.json();
}
