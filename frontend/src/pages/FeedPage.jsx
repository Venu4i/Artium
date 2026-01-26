import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

// Import the specific api utility (no local storage usage)
import api from '../api/axios'; // Path to the file you provided

// Import Components
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import HeroBanner from '../components/dashboard/HeroBanner';
import FeedCard from '../components/dashboard/FeedCard';

const FeedPage = () => {
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Feed
                // Using api.get instead of axios.get
                // No headers needed; api.interceptors handles the token via Redux store
                const feedRes = await api.get('/artworks/feed');
                setArtworks(feedRes.data.data);

                // 2. Get User Stats (Profile)
                const userRes = await api.get('/users/profile');
                setCurrentUser(userRes.data.data);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
                // If it's a 401, the interceptor in api.js tries refresh.
                // If refresh fails, it logs out. You can handle redirect here if needed.
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-violet-500/30">

            {/* Sidebar Component */}
            <Sidebar user={currentUser} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* TopBar Component */}
                <TopBar
                    user={currentUser}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Scrollable Feed Area */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                    <HeroBanner username={currentUser?.username} />

                    {/* Feed Grid */}
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                            </div>
                        ) : artworks.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                                <p className="text-xl">No artworks found.</p>
                                <p className="text-sm">Be the first to post something amazing!</p>
                            </div>
                        ) : (
                            // Masonry Layout
                            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                                <AnimatePresence>
                                    {artworks.map((art, i) => (
                                        <FeedCard key={art._id} artwork={art} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Action Button (Mobile Only) */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/upload')}
                    className="absolute bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/40 text-white z-50 md:hidden"
                >
                    <PlusIcon className="w-8 h-8" />
                </motion.button>

            </main>
        </div>
    );
};

export default FeedPage;