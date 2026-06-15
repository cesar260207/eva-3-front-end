import { getHeaders } from "./authService"; 

// CAMBIA LA "s" AL FINAL POR NADA:
const API_URL = "http://localhost:3000/api/sport"; 

export const getSports = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  return await response.json();
};

export const createSport = async (sportData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(sportData),
  });
  return await response.json();
};

export const updateSport = async (id, sportData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(sportData),
  });
  return await response.json();
};

export const deleteSport = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await response.json();
};

export const updateSportStatus = async (id, status) => {
  // Nota: Aquí la URL concatena automáticamente al ser dinámica
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return await response.json();
};