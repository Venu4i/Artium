// test-socket-A.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTEyNDVlYzIwZTFkMzdiMTEzNTcxN2QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3Njg3NzEwMTIsImV4cCI6MTc2ODc3MTkxMn0.QqtqyRU3sRWQKR6gXIEMSoO4AekB46rnGFyr92K0cF4"
  },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("🟢 User A connected:", socket.id);
});


socket.emit("send-message", {
  content: "Hello User B",
  receiver: "696d471b214d56223481095d",
  conversationId: "696d480e99bb6cd8ea923b74",
});
