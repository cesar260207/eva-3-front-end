const API_URL = "http://localhost:3000/api";

export const loginUser = async (credentials) => {
  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error("Por favor, complete todos los campos obligatorios.");
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Credenciales inválidas. Verifique su correo y contraseña.");
  }

  return {
    success: true,
    token: result.data.token,
    user: {
      id: result.data.user.id,
      name: result.data.user.full_name,
      email: result.data.user.email,
      role: result.data.user.role
    }
  };
};

export const registerUser = async (userData) => {
  // CORRECCIÓN: Ahora validamos 'full_name' en lugar de 'name'
  if (!userData || !userData.full_name || !userData.email || !userData.password) {
    throw new Error("Por favor, complete todos los campos obligatorios.");
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // CORRECCIÓN: Enviamos 'full_name' al servidor
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user"
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al registrar el usuario en el servidor.");
  }

  return data;
};

const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    if (pad) {
      payload += "=".repeat(4 - pad);
    }
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
};

export const saveSession = (token) => {
  try {
    localStorage.setItem("token", token);
  } catch (e) {
    console.error("Error al guardar la sesión", e);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (e) {
    return null;
  }
};

export const getHeaders = () => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};
export const getUser = () => {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    name: payload.full_name || payload.name || "",
    email: payload.email || "",
    role: payload.role || ""
  };
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  try {
    localStorage.removeItem("token");
  } catch (e) {
    console.error("Error al limpiar la sesión", e);
  }
};