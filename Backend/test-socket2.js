// test-socket-B.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTZkNDcxYjIxNGQ1NjIyMzQ4MTA5NWQiLCJlbWFpbCI6InRlc3QzQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY4NzcxMDU0LCJleHAiOjE3Njg3NzE5NTR9.urKgPDStwLotwbuP-sabljyUMZz-nVcUYRSPn1HxXqY"
  },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("🟢 User B connected:", socket.id);
});

// Listen for incoming messages
socket.on("new-message", (msg) => {
  console.log("📩 User B received:", msg.content);
});
