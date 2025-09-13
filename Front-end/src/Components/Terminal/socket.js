// socket.js
import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const socket = io(BACKEND_URL);
export default socket;
