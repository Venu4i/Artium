import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // 🚨 FIX: Extract 'user' directly from your auth state
  // If your slice puts it in state.auth.user, use that.
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // 🚨 FIX: Check for the 'user' object since that's what App.jsx sets
    if (!user) {
      console.log("🔒 No user found in Redux. Socket standby.");
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log("📡 Initializing Socket Connection for:", user.username);

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      auth: {
        // Ensure this matches how your backend expects the token/user
        userId: user._id 
      },
      withCredentials: true,
      transports: ["websocket"], 
    });

    newSocket.on("connect", () => {
      console.log("✅ Artium Socket Connected! ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket Handshake Error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Closing Socket Connection");
      newSocket.close();
      setSocket(null);
    };
  }, [user?._id]); // Only re-run if the User ID actually changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);