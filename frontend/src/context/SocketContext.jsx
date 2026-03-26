import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only attempt connection if we are authenticated and have a token
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log("📡 Initializing Chroma Socket Connection...");

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      auth: {
        token: token, // This matches backend socketAuth.js: const token = socket.handshake.auth.token;
      },
      withCredentials: true,
      transports: ["websocket"], // Forces modern websocket transport
    });

    newSocket.on("connect", () => {
      console.log("✅ Chroma Canvas Connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket Handshake Error:", err.message);
    });

    setSocket(newSocket);

    // Cleanup on logout or unmount
    return () => {
      console.log("🔌 Closing Socket Connection");
      newSocket.close();
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);