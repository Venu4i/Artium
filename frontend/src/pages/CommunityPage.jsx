import React, { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import axios from "axios";

const CommunityPage = ({ communityId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Join this specific community room
    socket.emit("join_community_room", communityId);

    // 2. Listen for new members
    const handleNewMember = (data) => {
      const msg = `👋 ${data.username} just joined the community!`;
      setLogs((prev) => [...prev, msg]);
    };

    socket.on("new_member_joined", handleNewMember);

    // Cleanup
    return () => {
      socket.off("new_member_joined", handleNewMember);
      // socket.emit("leave_community_room", communityId); // Optional
    };
  }, [communityId]);

  const handleJoin = async () => {
    await axios.post(`/api/community/${communityId}/join`);
    // Note: If public, the socket event 'new_member_joined' will fire immediately after this
  };

  return (
    <div>
      <h2>Community Feed</h2>
      <button onClick={handleJoin}>Join Community</button>
      
      <div className="logs">
        <h3>Live Updates:</h3>
        {logs.map((log, i) => <p key={i}>{log}</p>)}
      </div>
    </div>
  );
};

export default CommunityPage;