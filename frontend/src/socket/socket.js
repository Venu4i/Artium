import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // Your Backend URL
export const socket = io(ENDPOINT);