import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://192.168.1.65:3000";

// CREATE API INSTANCE
export function createApi(resource: string) {
  const api = axios.create({
    baseURL: `${API_BASE_URL}/${resource}`,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // REQUEST INTERCEPTOR
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Sauvegarde l'heure de départ
      (config as any).metadata = {
        startTime: new Date(),
      };

      const fullUrl = `${config.baseURL || ""}${config.url || ""}`;

      console.group(
        `🚀 ${config.method?.toUpperCase()} ${fullUrl}`
      );

      console.log("URL complète :", fullUrl);
      console.log("Méthode :", config.method?.toUpperCase());
      console.log("Headers :", config.headers);
      console.log("Query Params :", config.params);

      if (config.data) {
        console.log("Body :", config.data);
      }

      console.groupEnd();

      return config;
    },
    (error) => {
      console.error("❌ Erreur avant envoi de la requête :", error);
      return Promise.reject(error);
    }
  );

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any).metadata?.startTime;
      const duration = startTime
        ? new Date().getTime() - startTime.getTime()
        : 0;

      const fullUrl = `${response.config.baseURL || ""}${
        response.config.url || ""
      }`;

      console.group(
        `✅ ${response.status} ${response.config.method?.toUpperCase()} ${fullUrl}`
      );

      console.log("Temps :", `${duration} ms`);
      console.log("Status :", response.status);
      console.log("Status Text :", response.statusText);
      console.log("Response :", response.data);

      console.groupEnd();

      return response;
    },
    (error) => {
      const config = error.config;

      const fullUrl = config
        ? `${config.baseURL || ""}${config.url || ""}`
        : "URL inconnue";

      console.group(`❌ ERREUR ${fullUrl}`);

      console.log("Status :", error.response?.status);
      console.log("Message :", error.message);
      console.log("Response :", error.response?.data);
      console.log("Headers :", error.response?.headers);

      console.groupEnd();

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        const currentPath = window.location.pathname;

        if (currentPath !== "/login") {
          window.location.replace("/login");
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}