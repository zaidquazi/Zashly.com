import axios from "axios";

// Determine base URL depending on environment
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://your-backend-api.com/api"; // production URL

// Create a single axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
  headers: {
    "Content-Type": "application/json",
  },
});
