import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8001/api" : "/api"),
  withCredentials: true,
});

export default API;
