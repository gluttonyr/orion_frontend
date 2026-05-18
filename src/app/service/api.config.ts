import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// CREATE API INSTANCE
export function createApi(resource: string) {
  const api = axios.create({
    baseURL: `${API_BASE_URL}/${resource}`,
    timeout: 10000, headers: {"Content-Type": "application/json",},
  });

  // REQUEST INTERCEPTOR
  api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");

      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;},

    (error) => { return Promise.reject(error);}
  );

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use((response) => response, (error) => {
      if (error.response?.status === 401) {
        // Token expiré
        localStorage.removeItem("token");
        const currentPath = window.location.pathname;
  
        // ne pas rediriger, si déjà sur login
        if (currentPath !== "/login") { window.location.replace("/login");}
  
        console.error("Erreur API :", error.response?.data || error.message);
        return Promise.reject(error);
      }
    }
  );
  return api;
}