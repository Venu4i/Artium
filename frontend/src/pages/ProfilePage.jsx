import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import EditProfileModal from '../components/EditProfileModal';
import { MapPinIcon, LinkIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 1. DEBUG: Check if token exists
        const token = localStorage.getItem("accessToken");
        console.log("🔑 Debug Token:", token); // check console!

        if (!token) {
          throw new Error("No login token found. Please log in again.");
        }

        // 2. DEBUG: Ensure URL matches your Backend Port (8000 vs 5000)
        // My previous backend code used port 8000 and /api/users
        const response = await api.get("/user/profile");


        console.log("✅ Profile Data:", response.data);
        setUser(response.data.data);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        // Handle 401 specifically
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
          // Optional: Redirect to login
          // window.location.href = "/login";
        } else {
          setError(err.message || "Could not load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* 1. HEADER / COVER IMAGE */}
      <div className="relative h-64 w-full bg-slate-900 overflow-hidden group">
        <img
          src={user?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"}
          alt="Cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">

        {/* 2. PROFILE INFO CARD */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pb-6 border-b border-white/10">

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">

            {/* AVATAR */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-slate-950 ring-4 ring-violet-500/30"
            >
              <img
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
                alt={user?.username}
                className="w-full h-full rounded-full object-cover border-4 border-slate-950"
              />
            </motion.div>

            {/* TEXT DETAILS */}
            <div className="text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-white capitalize">{user?.username || "Artist"}</h1>

              <div className="flex items-center gap-4 mt-2 justify-center md:justify-start text-sm text-slate-400">
                <span><strong className="text-white">{user?.followers?.length || 0}</strong> Followers</span>
                <span><strong className="text-white">{user?.following?.length || 0}</strong> Following</span>
              </div>

              {/* Skills */}
              {user?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mb-4 md:mb-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-medium transition-all"
            >
              Edit Profile
            </motion.button>
          </div>
        </div>

        {/* 3. BIO & SOCIALS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-2">About</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {user?.bio || "No bio added yet."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {user?.socialLinks?.portfolio && (
              <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-violet-500/50 transition-colors group">
                <LinkIcon className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-slate-300">Portfolio Website</span>
              </a>
            )}
          </div>
        </div>

        {/* 4. TABS */}
        <div className="flex gap-8 mt-12 border-b border-white/10">
          {['posts', 'liked', 'bookmarked'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-all relative capitalize ${activeTab === tab ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {tab === 'posts' ? 'Artworks' : tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* 5. GRID CONTENT */}
        <div className="py-10">
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <PaintBrushIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>No artworks yet.</p>
          </div>
        </div>

      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        user={user}
        setUser={setUser}
      />
    </div>
  );
};

export default ProfilePage;