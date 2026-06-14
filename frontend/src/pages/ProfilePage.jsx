import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import EditProfileModal from '../components/EditProfileModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { currentUser, refreshUser } = useOutletContext();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Tabs: artworks, liked, saved
    const [activeTab, setActiveTab] = useState('artworks');
    const [artworks, setArtworks] = useState([]);
    const [likedArtworks, setLikedArtworks] = useState([]);
    const [savedArtworks, setSavedArtworks] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/user/profile');
                setUser(response.data.data);
            } catch (err) {
                console.error('Fetch Error:', err);
                if (err.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                } else {
                    setError(err.message || 'Could not load profile.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (!user?._id) return;
        
        const fetchTabData = async () => {
            setTabLoading(true);
            try {
                if (activeTab === 'artworks') {
                    if (artworks.length === 0) {
                        const res = await api.get(`/artworks/by-owner/${user._id}`);
                        setArtworks(res.data.data || []);
                    }
                } else if (activeTab === 'liked') {
                    if (likedArtworks.length === 0) {
                        const res = await api.get('/artworks/my-likes');
                        setLikedArtworks(res.data.data || []);
                    }
                } else if (activeTab === 'saved') {
                    // Not connected to backend yet
                    setSavedArtworks([]);
                }
            } catch (err) {
                console.error("Failed to fetch tab data", err);
            } finally {
                setTabLoading(false);
            }
        };

        fetchTabData();
    }, [user?._id, activeTab]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-outline">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-error">{error}</div>;

    const displayedArtworks = 
        activeTab === 'artworks' ? artworks :
        activeTab === 'liked' ? likedArtworks :
        savedArtworks;

    return (
        <div className="bg-background dark:bg-on-background text-on-surface dark:text-surface-bright font-body-regular antialiased min-h-screen relative overflow-x-hidden pb-24">
            
            {/* Back Button Floating */}
            <button 
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 z-50 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border border-white/20 transition-all shadow-lg flex items-center justify-center"
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>

            {/* SECTION 1: HERO BANNER */}
            <section className="relative w-full h-72 group">
                <img 
                    alt="Cover Banner" 
                    className="w-full h-full object-cover" 
                    src={user?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-0 left-0 w-1/4 h-full bg-fuchsia-500/30 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/4 h-full bg-violet-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
                
                <div className="absolute top-stack-lg right-container-padding-desktop opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20 text-sm font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Cover
                    </button>
                </div>
            </section>

            {/* SECTION 2: IDENTITY ROW */}
            <section className="bg-surface dark:bg-on-background border-b border-surface-variant dark:border-outline-variant/30 px-container-padding-mobile md:px-container-padding-desktop pb-stack-lg pt-4 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end gap-stack-lg relative">
                    {/* Left: Avatar & Info */}
                    <div className="flex-1 flex flex-col md:flex-row gap-stack-lg w-full relative -mt-16 md:-mt-20 z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0 w-32 h-32 rounded-2xl p-1 bg-gradient-to-br from-fuchsia-500 to-violet-500 shadow-xl">
                            <img 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover rounded-xl border-[4px] border-surface dark:border-on-background" 
                                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
                            />
                        </div>
                        
                        {/* Text Info */}
                        <div className="mt-4 md:mt-20 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2">
                                <h1 className="font-display-lg text-headline-md md:text-[36px] tracking-tight font-black capitalize">
                                    {user?.username || "Artist"}
                                </h1>
                                <span className="material-symbols-outlined text-secondary dark:text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <p className="text-on-surface-variant dark:text-outline font-data-mono">@{user?.username?.toLowerCase() || "artist"}</p>
                            <p className="mt-2 text-body-regular text-on-surface-variant dark:text-outline-variant max-w-xl whitespace-pre-wrap">
                                {user?.bio || "No bio added yet."}
                            </p>
                            
                            {/* Skill Tags */}
                            {user?.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {user.skills.map((skill, index) => {
                                        const colors = [
                                            "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800/50",
                                            "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/50",
                                            "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50"
                                        ];
                                        const colorClass = colors[index % colors.length];
                                        return (
                                            <span key={index} className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
                                                {skill}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center: Stats */}
                    <div className="hidden lg:flex items-center gap-6 px-6 py-3 rounded-2xl bg-surface-container-low dark:bg-inverse-surface border border-surface-variant dark:border-outline-variant/20 self-end mb-2 shrink-0">
                        <div className="flex flex-col items-center">
                            <span className="font-data-mono text-lg font-bold">{user?.followers?.length || 0}</span>
                            <span className="text-xs text-on-surface-variant dark:text-outline uppercase tracking-wider">Followers</span>
                        </div>
                        <div className="w-px h-8 bg-outline-variant/30"></div>
                        <div className="flex flex-col items-center">
                            <span class="font-data-mono text-lg font-bold">{user?.following?.length || 0}</span>
                            <span className="text-xs text-on-surface-variant dark:text-outline uppercase tracking-wider">Following</span>
                        </div>
                        <div className="w-px h-8 bg-outline-variant/30"></div>
                        <div className="flex flex-col items-center">
                            <span className="font-data-mono text-lg font-bold">{user?.posts?.length || 0}</span>
                            <span className="text-xs text-on-surface-variant dark:text-outline uppercase tracking-wider">Artworks</span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex w-full md:w-auto gap-3 shrink-0 self-end mb-2">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-on-surface dark:bg-surface-bright text-surface dark:text-on-surface font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            Edit Profile
                        </button>
                        {user?.socialLinks?.portfolio && (
                            <a 
                                href={user.socialLinks.portfolio} 
                                target="_blank" rel="noopener noreferrer"
                                className="p-2.5 rounded-full border border-outline-variant dark:border-outline text-on-surface-variant dark:text-surface-bright hover:bg-surface-container-high dark:hover:bg-inverse-surface transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">language</span>
                            </a>
                        )}
                        <button className="p-2.5 rounded-full border border-outline-variant dark:border-outline text-on-surface-variant dark:text-surface-bright hover:bg-surface-container-high dark:hover:bg-inverse-surface transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* SECTION 3: GAMIFICATION TROPHY SHELF */}
            <section className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-lg">
                    {/* Chips */}
                    <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-200 dark:border-fuchsia-900/50 shrink-0">
                            <span className="material-symbols-outlined text-fuchsia-600 dark:text-fuchsia-400" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-outline">Global Rank</span>
                                <span className="font-timer-lg text-sm text-fuchsia-700 dark:text-fuchsia-300">#{user?.rank || "N/A"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-200 dark:border-violet-900/50 shrink-0">
                            <span className="material-symbols-outlined text-violet-600 dark:text-violet-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-outline">Total Points</span>
                                <span className="font-timer-lg text-sm text-violet-700 dark:text-violet-300">{user?.points?.global || 0} pts</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-900/50 shrink-0">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-outline">Challenges Won</span>
                                <span className="font-timer-lg text-sm text-amber-700 dark:text-amber-300">{user?.completedChallenges?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: STICKY TABS */}
            <section className="sticky top-0 z-40 bg-background/90 dark:bg-on-background/90 backdrop-blur-md border-b border-surface-variant dark:border-outline-variant/30">
                <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['artworks', 'liked', 'saved'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative py-4 text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab 
                                    ? 'font-bold text-on-surface dark:text-surface-bright' 
                                    : 'font-medium text-on-surface-variant dark:text-outline hover:text-on-surface dark:hover:text-surface-bright'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'artworks' && `(${artworks.length})`}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: MASONRY GRID */}
            <section className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg">
                {tabLoading ? (
                    <div className="text-center py-10 text-outline">Loading...</div>
                ) : displayedArtworks.length > 0 ? (
                    <div className="masonry-grid">
                        {displayedArtworks.map((art) => (
                            <div key={art._id} className="masonry-item relative group rounded-2xl overflow-hidden cursor-pointer">
                                <img 
                                    src={art.image || art.imageUrl} 
                                    alt={art.title} 
                                    className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700 ease-out bg-surface-container-high" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-white font-bold text-lg leading-tight mb-1">{art.title}</h3>
                                            {art.description && <p className="text-white/70 text-sm line-clamp-1">{art.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                                            <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[20px]">favorite</span>
                                                <span className="text-xs font-bold">{art.likes?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-on-surface-variant dark:text-outline flex flex-col items-center">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">imagesmode</span>
                        <p className="text-lg">No {activeTab} found.</p>
                    </div>
                )}
            </section>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                closeModal={() => setIsEditModalOpen(false)} 
                user={user}
                refreshUser={refreshUser}
                onUpdateSuccess={(updatedUser) => {
                    setUser(updatedUser);
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
};

export default ProfilePage;