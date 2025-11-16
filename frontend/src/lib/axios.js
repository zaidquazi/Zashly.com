import axios from "axios";

// Local development API base URL
const BASE_URL = "http://localhost:5001/api";

// Create a single axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
  headers: {
    "Content-Type": "application/json",
  },
});
