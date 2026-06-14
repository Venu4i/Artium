import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import communityService from "../services/communityService";

const CommunityPantheon = () => {
    const { community, currentUser } = useOutletContext();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await communityService.getLeaderboard(community._id);
                setLeaderboard(response.leaderboard || []);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [community._id, currentUser]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-community-tertiary"></div>
            </div>
        );
    }

    const rank1 = leaderboard.find(u => u.rank === 1);
    const rank2 = leaderboard.find(u => u.rank === 2);
    const rank3 = leaderboard.find(u => u.rank === 3);
    const otherRanks = leaderboard.filter(u => u.rank > 3).sort((a, b) => a.rank - b.rank);
    const currentUserRank = leaderboard.find(u => u.isCurrentUser);

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full h-full pb-32">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-10 pt-10 flex flex-col gap-8">
                
                {/* Status Banner */}
                <div className="bg-community-surface/40 dark:bg-community-surface-dim/40 border border-community-secondary/30 rounded-xl p-4 flex items-center gap-3 shadow-lg backdrop-blur-md">
                    <span className="material-symbols-outlined text-community-secondary">info</span>
                    <p className="font-body text-[16px] text-community-on-surface">Leaderboard will update once the admin finalizes the current challenge review.</p>
                </div>

                {/* Podium Section (Ranks 1-3) */}
                <div className="flex justify-center items-end h-[350px] mt-12 mb-8 gap-4 md:gap-6 relative">
                    {/* Rank 2 (Silver) */}
                    {rank2 && (
                        <div className="flex flex-col items-center z-10">
                            <div className="relative mb-4 group cursor-pointer">
                                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-b from-gray-300 to-gray-500 shadow-[0_0_20px_rgba(209,213,219,0.3)] group-hover:scale-105 transition-transform">
                                    <img alt="Rank 2 Avatar" className="w-full h-full rounded-full object-cover border-2 border-community-background" src={rank2.avatar} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gray-300 text-black flex items-center justify-center font-data-mono text-[12px] font-bold border-2 border-community-background">2</div>
                            </div>
                            <div className="text-center mb-4">
                                <div className="font-headline text-[18px] text-community-on-surface font-bold">{rank2.name}</div>
                                <div className="font-data-mono text-[14px] text-gray-400 font-bold">{(rank2.points / 1000).toFixed(1)}k pts</div>
                            </div>
                            <div className="w-24 md:w-32 h-[160px] bg-gradient-to-t from-community-container-highest to-community-surface border-t border-x border-white/10 rounded-t-2xl relative overflow-hidden flex flex-col justify-end pb-8 items-center">
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-400/20 to-transparent"></div>
                                <span className="material-symbols-outlined text-gray-400 opacity-50 text-4xl">military_tech</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {rank1 && (
                        <div className="flex flex-col items-center z-20">
                            <div className="relative mb-6 group cursor-pointer">
                                <span className="material-symbols-outlined absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">workspace_premium</span>
                                <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-b from-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(250,204,21,0.4)] group-hover:scale-105 transition-transform">
                                    <img alt="Rank 1 Avatar" className="w-full h-full rounded-full object-cover border-2 border-community-background" src={rank1.avatar} />
                                </div>
                                <div className="absolute -bottom-3 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-black flex items-center justify-center font-data-mono text-[14px] font-bold border-2 border-community-background">1</div>
                            </div>
                            <div className="text-center mb-6">
                                <div className="font-headline text-[20px] text-community-on-surface font-bold">{rank1.name}</div>
                                <div className="font-data-mono text-[14px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-community-secondary to-community-tertiary drop-shadow-md">{(rank1.points / 1000).toFixed(1)}k pts</div>
                            </div>
                            <div className="w-28 md:w-40 h-[220px] bg-gradient-to-t from-community-container-highest to-community-surface rounded-t-2xl border-t border-x border-yellow-500/30 relative overflow-hidden flex flex-col justify-end pb-12 items-center shadow-[0_-10px_40px_-10px_rgba(250,204,21,0.15)]">
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
                                <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                                <span className="material-symbols-outlined text-yellow-500/60 text-5xl">diamond</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {rank3 && (
                        <div className="flex flex-col items-center z-10">
                            <div className="relative mb-4 group cursor-pointer">
                                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-b from-amber-600 to-amber-800 shadow-[0_0_20px_rgba(217,119,6,0.3)] group-hover:scale-105 transition-transform">
                                    <img alt="Rank 3 Avatar" className="w-full h-full rounded-full object-cover border-2 border-community-background" src={rank3.avatar} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-600 text-black flex items-center justify-center font-data-mono text-[12px] font-bold border-2 border-community-background">3</div>
                            </div>
                            <div className="text-center mb-4">
                                <div className="font-headline text-[18px] text-community-on-surface font-bold">{rank3.name}</div>
                                <div className="font-data-mono text-[14px] text-amber-500 font-bold">{(rank3.points / 1000).toFixed(1)}k pts</div>
                            </div>
                            <div className="w-24 md:w-32 h-[120px] bg-gradient-to-t from-community-container-highest to-community-surface rounded-t-2xl border-t border-x border-white/10 relative overflow-hidden flex flex-col justify-end pb-6 items-center">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-700/20 to-transparent"></div>
                                <span className="material-symbols-outlined text-amber-700/50 text-3xl">star</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ranks 4+ List (Bento-style rows) */}
                <div className="flex flex-col gap-3 mt-4">
                    {otherRanks.map((user) => (
                        <div 
                            key={user.id} 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-colors shadow-sm relative overflow-hidden group cursor-pointer ${
                                user.isCurrentUser 
                                    ? "bg-community-surface-variant/50 border-community-secondary/30 shadow-[0_0_20px_rgba(255,176,205,0.1)]" 
                                    : "bg-community-surface/60 hover:bg-community-surface-variant/40 border-black/5 dark:border-white/5"
                            }`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${user.isCurrentUser ? "bg-gradient-to-b from-community-secondary to-community-tertiary" : "bg-gradient-to-b from-community-secondary to-community-tertiary opacity-0 group-hover:opacity-100 transition-opacity"}`}></div>
                            
                            {user.isCurrentUser && (
                                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-community-secondary/10 to-transparent pointer-events-none"></div>
                            )}

                            <div className="flex items-center gap-4">
                                <span className={`font-data-mono text-[16px] w-8 text-center font-bold ${user.isCurrentUser ? "text-community-secondary" : "text-community-on-surface-variant"}`}>
                                    {user.rank}
                                </span>
                                <div className={`w-10 h-10 rounded-full overflow-hidden ${user.isCurrentUser ? "border-2 border-community-secondary p-[1px]" : "border border-black/10 dark:border-white/10"}`}>
                                    <img alt={`Avatar ${user.rank}`} className="w-full h-full object-cover rounded-full" src={user.avatar || "https://res.cloudinary.com/demo/image/upload/v1633535288/sample.jpg"} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-headline text-[16px] text-community-on-surface font-bold">{user.name}</span>
                                    <span className="font-body text-[14px] text-community-on-surface-variant">{user.challenges} challenges completed</span>
                                </div>
                            </div>
                            <div className={`font-data-mono text-[14px] font-bold ${user.isCurrentUser ? "text-community-on-surface" : "bg-clip-text text-transparent bg-gradient-to-r from-community-secondary to-community-tertiary"}`}>
                                {(user.points / 1000).toFixed(1)}k pts
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Bottom Bar (Current User Rank Focus) */}
            {currentUserRank && (
                <div className="fixed bottom-0 left-0 w-full bg-community-surface/90 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 z-50 py-4 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 py-2 px-6 rounded-full border border-black/5 dark:border-white/5">
                        <span className="font-body text-[14px] text-community-on-surface-variant">Your rank in this community:</span>
                        <span className="font-data-mono text-[18px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-community-secondary to-community-tertiary">#{currentUserRank.rank}</span>
                        <span className="text-community-on-surface-variant mx-1">·</span>
                        <span className="font-data-mono text-[14px] text-community-on-surface font-bold">{currentUserRank.points.toLocaleString()} pts</span>
                        <button className="ml-4 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[20px] text-community-on-surface">keyboard_arrow_up</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPantheon;
