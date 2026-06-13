import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../services/userService';

const HallOfFame = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const res = await userService.getGlobalLeaderboard();
                setLeaderboard(res.data || res);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const rank1 = leaderboard.find(u => u.rank === 1);
    const rank2 = leaderboard.find(u => u.rank === 2);
    const rank3 = leaderboard.find(u => u.rank === 3);
    const otherRanks = leaderboard.filter(u => u.rank > 3);
    const currentUserRecord = leaderboard.find(u => u.isCurrentUser);

    let progressPercentage = 100;
    let targetPoints = 0;
    if (currentUserRecord && currentUserRecord.rank > 1) {
        const targetUser = leaderboard.find(u => u.rank === currentUserRecord.rank - 1);
        if (targetUser) {
            targetPoints = targetUser.globalPoints;
            const current = currentUserRecord.globalPoints || 0;
            const target = targetPoints || 1; // avoid divide by zero
            progressPercentage = Math.min(100, Math.max(0, (current / target) * 100));
        } else {
            // Fallback if the user above isn't in the loaded dataset
            progressPercentage = 75;
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full relative pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 pt-4">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                        Hall of Fame
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Global rankings across all communities.</p>
                </div>
            </header>

            {/* Podium Section */}
            <section className="relative py-12 flex justify-center items-end h-[450px] mb-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-3/4 bg-rose-500/20 dark:bg-rose-500/10 blur-[80px] rounded-full pointer-events-none z-0"></div>
                <div className="flex items-end gap-2 md:gap-6 z-10">
                    {/* Rank 2: Silver */}
                    {rank2 && (
                        <div 
                            className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-2"
                            onClick={() => setSelectedUser(rank2)}
                        >
                            <div className="relative mb-3">
                                <img alt="Silver Rank" className="w-[72px] h-[72px] rounded-full border-4 border-slate-300 dark:border-slate-500 bg-white dark:bg-zinc-800 object-cover" src={rank2.avatar}/>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 dark:bg-slate-500 text-slate-900 px-2 rounded font-bold text-xs">#2</div>
                            </div>
                            <div className="h-[100px] w-24 md:w-32 bg-slate-200/50 dark:bg-slate-500/20 backdrop-blur border-t border-slate-300 dark:border-slate-500/40 flex flex-col items-center justify-start pt-2 rounded-t-xl">
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center px-1">{rank2.username}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{rank2.globalPoints.toLocaleString()} PTS</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1: Gold */}
                    {rank1 && (
                        <div 
                            className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-4"
                            onClick={() => setSelectedUser(rank1)}
                        >
                            <div className="relative mb-3 scale-110">
                                <img alt="Gold Rank" className="w-[96px] h-[96px] rounded-full border-4 border-amber-400 bg-white dark:bg-zinc-800 shadow-[0_0_30px_rgba(251,191,36,0.3)] object-cover" src={rank1.avatar}/>
                                <span className="material-symbols-outlined absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            </div>
                            <div className="h-[140px] w-32 md:w-48 bg-amber-100 dark:bg-amber-400/20 backdrop-blur border-t border-amber-400/40 flex flex-col items-center justify-start pt-4 rounded-t-2xl shadow-xl dark:shadow-2xl">
                                <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 truncate w-full text-center px-2">{rank1.username}</span>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-200 font-mono mt-1">{rank1.globalPoints.toLocaleString()} PTS</span>
                                <div className="mt-4 px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/30 text-[10px] text-amber-600 dark:text-amber-400 tracking-widest uppercase font-bold">Global Champion</div>
                            </div>
                        </div>
                    )}

                    {/* Rank 3: Bronze */}
                    {rank3 && (
                        <div 
                            className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-2"
                            onClick={() => setSelectedUser(rank3)}
                        >
                            <div className="relative mb-3">
                                <img alt="Bronze Rank" className="w-[64px] h-[64px] rounded-full border-4 border-amber-700 bg-white dark:bg-zinc-800 object-cover" src={rank3.avatar}/>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-2 rounded font-bold text-xs">#3</div>
                            </div>
                            <div className="h-[80px] w-24 md:w-32 bg-amber-100/50 dark:bg-amber-700/20 backdrop-blur border-t border-amber-300 dark:border-amber-700/40 flex flex-col items-center justify-start pt-2 rounded-t-xl">
                                <span className="font-bold text-amber-800 dark:text-amber-600 truncate w-full text-center px-1">{rank3.username}</span>
                                <span className="text-xs text-amber-700 dark:text-amber-700 font-mono mt-1">{rank3.globalPoints.toLocaleString()} PTS</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Rank List */}
            {otherRanks.length > 0 && (
                <section className="space-y-2 max-w-5xl mx-auto">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 px-6 py-3 font-mono text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                        <div className="col-span-2 md:col-span-1">Rank</div>
                        <div className="col-span-7 md:col-span-8">Creative Identity</div>
                        <div className="col-span-3 text-right">Points</div>
                    </div>

                    {otherRanks.map(user => (
                        <motion.div 
                            key={user._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedUser(user)}
                            className={`grid grid-cols-12 items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 px-6 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer ${user.isCurrentUser ? 'ring-2 ring-rose-500/50 bg-rose-50 dark:bg-rose-500/5' : ''}`}
                        >
                            <div className="col-span-2 md:col-span-1 font-mono text-xl text-slate-400 dark:text-slate-500">
                                {String(user.rank).padStart(2, '0')}
                            </div>
                            <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                                <img className={`w-11 h-11 rounded-full object-cover bg-slate-100 dark:bg-zinc-800 ${user.isCurrentUser ? 'border-2 border-rose-500' : 'border border-slate-200 dark:border-white/5'}`} src={user.avatar} alt="avatar" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-slate-900 dark:text-white truncate">{user.username} {user.isCurrentUser && <span className="text-[10px] font-normal text-rose-500 ml-2">(You)</span>}</span>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 hidden md:flex">
                                        <span className="text-[10px] text-slate-500">Joined {new Date(user.createdAt).getFullYear()}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                            {user.communitiesCount} {user.communitiesCount === 1 ? 'Community' : 'Communities'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 text-right">
                                <span className="font-mono text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
                                    {user.globalPoints.toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </section>
            )}

            {/* Sticky Bottom Bar */}
            {currentUserRecord && (
                <footer className="fixed bottom-0 right-0 left-0 md:left-[18rem] z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 md:px-10 py-4 rounded-t-2xl">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
                                #{currentUserRecord.rank}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    Your Global Rank: #{currentUserRecord.rank} <span className="mx-2 text-slate-300 dark:text-white/20">|</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">{currentUserRecord.globalPoints.toLocaleString()} PTS</span>
                                </span>
                                <span className="text-[10px] uppercase text-slate-500 font-mono">
                                    {currentUserRecord.rank <= 3 ? 'Elite Tier' : 'Contender'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 max-w-md w-full px-4">
                            <div className="flex justify-between text-[10px] mb-1 font-mono text-slate-500">
                                <span>PROGRESS TO #{Math.max(1, currentUserRecord.rank - 1)}</span>
                                <span>{targetPoints > 0 ? `${targetPoints.toLocaleString()} PTS` : 'KEEP CLIMBING'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            {/* Quick View Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center cursor-default"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[380px] bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10"
                        >
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 blur opacity-40"></div>
                                    <img className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 object-cover" src={selectedUser.avatar} alt="avatar"/>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedUser.username}</h3>
                                <div className="mt-2 px-3 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                                    #{selectedUser.rank} Global Rank
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3 w-full mt-6">
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
                                        <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono mb-1 text-center">Global Points</span>
                                        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{selectedUser.globalPoints.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
                                        <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono mb-1 text-center">Challenges</span>
                                        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{selectedUser.completedChallengesCount}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center">
                                        <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono mb-1 text-center">Communities</span>
                                        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{selectedUser.communitiesCount}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HallOfFame;
