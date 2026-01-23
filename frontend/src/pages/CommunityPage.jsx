import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

// CONFIGURATION
const API_URL = "http://localhost:5000/api/v1/community"; // Adjust to your route prefix
const SOCKET_URL = "http://localhost:5000";

function CommunityPage() {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Helper to add logs
  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time: timestamp, msg: message, type }]);
  };

  // 1. CONNECTION SETUP
  const connectUser = () => {
    if (!userId) return alert("Enter a User ID first!");

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // Force websocket for better performance
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      addLog("✅ Connected to Socket Server", "success");
      
      // Emit setup event to join private room
      newSocket.emit("setup", { _id: userId });
      addLog(`👤 Joined private room for User: ${userId}`, "info");
    });

    // LISTENER: Private Notifications
    newSocket.on("notification", (data) => {
      addLog(`🔔 NOTIFICATION (${data.type}): ${data.message}`, "warning");
      console.log("Notification Data:", data);
    });

    // LISTENER: Public Community Updates
    newSocket.on("new_member_joined", (data) => {
      addLog(`👥 NEW MEMBER: ${data.username || data.userId} joined community ${data.communityId}`, "success");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      addLog("🔴 Disconnected", "error");
    });

    setSocket(newSocket);
  };

  // 2. JOIN COMMUNITY ROOM (Socket)
  const listenToCommunity = () => {
    if (!socket) return alert("Connect as user first!");
    if (!communityId) return alert("Enter Community ID");

    socket.emit("join_community_room", communityId);
    addLog(`📡 Listening to updates for Community: ${communityId}`, "info");
  };

  // 3. API ACTION: JOIN (HTTP Request)
  const sendJoinRequest = async () => {
    if (!userId || !communityId) return alert("Need User ID & Community ID");

    try {
      addLog(`➡️ Sending HTTP Join Request...`, "info");
      // Note: You might need to handle Auth headers here depending on your middleware
      // For this test, we assume you might hack the backend to accept userId in body OR use Postman for this part
      addLog("⚠️ Use Postman to send the actual Join Request API call to see the notification here!", "warning");
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. User Simulation</h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-600">Simulate Login (User ID)</label>
              <input
                type="text"
                placeholder="Paste MongoDB User _id here"
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <button
                onClick={connectUser}
                disabled={isConnected}
                className={`p-2 rounded text-white font-bold transition ${
                  isConnected ? "bg-green-500 cursor-default" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isConnected ? "Connected ✅" : "Connect Socket"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Community Controls</h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-600">Community ID</label>
              <input
                type="text"
                placeholder="Paste Community _id here"
                className="p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={listenToCommunity}
                  className="flex-1 bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
                >
                  👂 Listen to Room
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Listening allows you to see "New Member" events in public communities.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGS */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-gray-300 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-white">Real-Time Logs</h2>
            <button 
              onClick={() => setLogs([])}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
            {logs.length === 0 && <p className="text-gray-600 italic">Waiting for events...</p>}
            {logs.map((log, i) => (
              <div key={i} className="border-l-2 pl-2 border-gray-600">
                <span className="text-gray-500 text-xs">[{log.time}]</span>{" "}
                <span className={`${
                  log.type === "error" ? "text-red-400" :
                  log.type === "success" ? "text-green-400" :
                  log.type === "warning" ? "text-yellow-400" : "text-blue-300"
                }`}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CommunityPage;