import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import communityService from '../services/communityService';
import { useAuth } from '../hooks/useAuth';
import { getSafeId, isSameUser } from '../utils/idHelper';

const ExploreCommunities = () => {
    const { currentUser } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added UI error state
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

    const handleJoin = async (communityId) => {
        if (joining.has(communityId)) return;
        
        setJoining((prev) => new Set(prev).add(communityId));
        try {
            await communityService.requestToJoin(communityId);
            // Optionally: alert("Request sent!");
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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-violet-400 font-medium">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3" />
            Scanning Studios...
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-red-400 p-6 text-center">
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
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Explore Studios</h1>
                    <p className="text-zinc-400">Discover and join artist communities</p>
                </header>

                {communities.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/5">
                        <p className="text-zinc-500 italic">No new studios found to join right now.</p>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {communities.map((community) => {
                            const cId = getSafeId(community);
                            const isPending = joining.has(cId);
                            const alreadyRequested = community.pendingRequests?.some(r => isSameUser(r, currentUser));

                            return (
                                <motion.div
                                    key={cId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20">
                                            {community.name?.[0] || 'A'}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            {community.isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>

                                    <h3 className="text-white text-lg font-bold group-hover:text-violet-400 transition-colors">
                                        {community.name}
                                    </h3>
                                    <p className="text-zinc-500 text-xs mt-1">
                                        Admin: <span className="text-violet-400">{community.admin?.username || "Unknown"}</span>
                                    </p>
                                    
                                    <p className="text-zinc-400 text-sm mt-2 line-clamp-2 flex-1">
                                        {community.description}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-bold">{community.members?.length || 0}</span>
                                            <span className="text-zinc-500 text-[10px] uppercase font-bold">Artists</span>
                                        </div>

                                        <button
                                            onClick={() => handleJoin(cId)}
                                            disabled={community.isPrivate || isPending || alreadyRequested}
                                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                                community.isPrivate || isPending || alreadyRequested
                                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                : 'bg-white text-black hover:bg-violet-500 hover:text-white shadow-xl hover:shadow-violet-500/40'
                                            }`}
                                        >
                                            {community.isPrivate ? 'Invite Only' : isPending ? 'Sending...' : alreadyRequested ? 'Sent' : 'Join Studio'}
                                        </button>
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