const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const isLocalDevelopment =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_BASE_URL =
  configuredApiUrl ||
  (isLocalDevelopment
    ? "http://127.0.0.1:8000"
    : "https://customer-support-ai-backend-2py4.onrender.com");

export default API_BASE_URL;
