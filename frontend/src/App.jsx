import { useState } from 'react'
import AuthPage from './components/AuthPage'
import { socket } from './socket/socket'
import CommunityPage from './pages/CommunityPage';

function App() {
  const [user, setUser] = useState(null); //get from login

  useEffect(() => {
    // Mock Login for demo
    const mockUser = { _id: "user123", username: "ArtistOne" };
    setUser(mockUser);

    // 1. Setup connection
    socket.emit("setup", mockUser);

    // 2. Global Notification Listener
    socket.on("notification", (data) => {
      alert(`🔔 New Notification: ${data.message}`);
      console.log("Notification Data:", data);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  return (
    <>
    <AuthPage />
    <CommunityPage />
    </>
  )
}

export default App
