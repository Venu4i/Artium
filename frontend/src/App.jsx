// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
// import { socket } from './socket/socket'; // Keep if you are using it globally

function App() {
  return (
    <Routes>
      {/* Route for Login/Signup */}
      <Route path="/" element={<AuthPage />} />
      
      {/* Route for Community Page */}
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;