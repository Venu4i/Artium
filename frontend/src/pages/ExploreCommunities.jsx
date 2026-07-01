import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import communityService from '../services/communityService';
import { useAuth } from '../hooks/useAuth';
import { getSafeId, isSameUser } from '../utils/idHelper';
import { useNavigate } from 'react-router-dom';

const ExploreCommunities = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(new Set());

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await communityService.getAllCommunities();
                
                // OPTIMAL DATA EXTRACTION: Handle raw array or .data wrapper
                const data = Array.isArray(response) ? response : (response?.data || []);
                setCommunities(data);
                
            } catch (err) {
                console.error('❌ Explore Fetch Error:', err);
                setError(err.response?.data?.error || 'Failed to load communities');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const handleJoin = async (communityId, isAlreadyRequested) => {
        if (isAlreadyRequested) {
            alert("Your join request is already pending!");
            return;
        }
        if (joining.has(communityId)) return;
        
        setJoining((prev) => new Set(prev).add(communityId));
        try {
            await communityService.requestToJoin(communityId);
            alert("Join request sent successfully!");
            
            // Update local state to immediately show 'Pending'
            setCommunities(prev => prev.map(c => {
                const cId = getSafeId(c);
                if (cId === communityId) {
                    return {
                        ...c,
                        pendingRequests: [...(c.pendingRequests || []), currentUser]
                    };
                }
                return c;
            }));
            
        } catch (err) {
            console.error('❌ Join Error:', err);
            alert(err.response?.data?.error || "Failed to send request");
        } finally {
            setJoining((prev) => {
                const updated = new Set(prev);
                updated.delete(communityId);
                return updated;
            });
        }
    };

    if (loading) return (
        <div className="w-full h-[60vh] flex items-center justify-center text-violet-400 font-medium">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3" />
            Scanning Studios...
        </div>
    );

    if (error) return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center text-red-400 p-6 text-center">
            <p className="text-xl font-bold mb-2">Oops! Something went wrong</p>
            <p className="text-zinc-500 text-sm mb-6">{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="w-full pb-12 overflow-x-hidden px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-fuchsia-500/10 blur-3xl -z-10 rounded-full scale-150 opacity-50"></div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-zinc-400">
                        Discover Studios
                    </h1>
                    <p className="text-slate-600 dark:text-zinc-400 max-w-2xl text-lg font-light">
                        Find your tribe across multiple artistic disciplines. Join creative collectives pushing the boundaries of digital and physical space.
                    </p>
                </header>

                {communities.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10">
                        <p className="text-slate-500 dark:text-zinc-400 italic">No new studios found to join right now.</p>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {communities.map((community, index) => {
                            const cId = getSafeId(community);
                            const isPending = joining.has(cId);
                            const alreadyRequested = community.pendingRequests?.some(r => isSameUser(r, currentUser));
                            const isMember = community.members?.some(m => isSameUser(m, currentUser));
                            const isAdmin = isSameUser(community.admin, currentUser);
                            const alreadyJoined = isMember || isAdmin;

                            return (
                                <motion.div
                                    key={cId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative rounded-[24px] bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-violet-500/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/20 flex flex-col h-[400px]"
                                >
                                    <div 
                                        className="h-[40%] relative p-4 overflow-hidden bg-slate-100 dark:bg-[#09090b]"
                                        style={
                                            community.coverImage 
                                                ? { backgroundImage: `url(${community.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                                                : index >= 2 
                                                ? { backgroundImage: `url(https://picsum.photos/seed/${cId}/800/400)`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                                : {}
                                        }
                                    >
                                        {/* Minimalist Grid Fallback (Only shows if no image) */}
                                        {!(community.coverImage || index >= 2) && (
                                            <>
                                                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="material-symbols-outlined text-4xl text-zinc-700 font-light">
                                                        interests
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Alpha shadow for badge readability if there's an image */}
                                        {(community.coverImage || index >= 2) && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md text-slate-800 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest border border-slate-300 dark:border-white/10">
                                                {community.isPrivate ? 'Private' : 'Public'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 bg-slate-50 dark:bg-black/20">
                                        <h3 className="text-slate-900 dark:text-white text-xl font-bold group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors line-clamp-1 mb-1">
                                            {community.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-zinc-500 text-xs mb-4">
                                            Admin: <span className="text-violet-500 dark:text-violet-400">{community.admin?.username || "Unknown"}</span>
                                        </p>
                                        
                                        <p className="text-slate-600 dark:text-zinc-400 text-sm line-clamp-2 flex-1">
                                            {community.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <img 
                                                            key={i}
                                                            alt="Member" 
                                                            className="w-6 h-6 rounded-full border border-zinc-900 object-cover" 
                                                            src={`https://ui-avatars.com/api/?name=User${i}&background=random&seed=${cId}${i}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-slate-600 dark:text-zinc-400 text-sm font-medium ml-1">{community.members?.length || 0} Artists</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (alreadyJoined) {
                                                        navigate(`/community/${cId}/workspace`);
                                                    } else {
                                                        handleJoin(cId, alreadyRequested);
                                                    }
                                                }}
                                                disabled={(community.isPrivate && !alreadyJoined && !alreadyRequested) || alreadyRequested || isPending}
                                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center ${
                                                    isPending
                                                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-200 dark:border-white/5'
                                                    : alreadyJoined
                                                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 gap-1'
                                                    : alreadyRequested
                                                    ? 'border border-slate-300 dark:border-white/20 text-slate-400 dark:text-zinc-400 cursor-not-allowed opacity-70'
                                                    : community.isPrivate
                                                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-200 dark:border-white/5'
                                                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90'
                                                }`}
                                            >
                                                {alreadyJoined ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Joined
                                                    </>
                                                ) : isPending ? 'Sending...' : alreadyRequested ? 'Request Sent' : community.isPrivate ? 'Invite Only' : 'Join Studio'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ExploreCommunities;