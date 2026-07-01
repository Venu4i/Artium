import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import communityService from "../services/communityService";
import { useSelector } from "react-redux";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { ShieldCheck, Users, Clock, Plus, ArrowRight, CheckCircle2 } from "lucide-react";

const MyCommunities = () => {
    const currentUser = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [managed, setManaged] = useState([]);
    const [joined, setJoined] = useState([]);
    const [pending, setPending] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await communityService.getMyCommunities();
                const allData = Array.isArray(response) ? response : (response?.data || []);
                const myId = String(currentUser?._id || "");
        
                const managedCommunities = allData.filter(c => {
                    const adminId = String(c.admin?._id || c.admin || "");
                    return adminId === myId;
                });
                
                const joinedCommunities = allData.filter(c => {
                    const isAdmin = String(c.admin?._id || c.admin || "") === myId;
                    const isMember = c.members?.some(m => String(m?._id || m) === myId);
                    return isMember && !isAdmin;
                });
        
                const pendingCommunities = allData.filter(c => 
                    c.pendingRequests?.some(r => String(r?._id || r) === myId)
                );
        
                setManaged(managedCommunities);
                setJoined(joinedCommunities);
                setPending(pendingCommunities);
            } catch (error) {
                console.error("Dashboard Error:", error);
            }
        };

        if (currentUser) fetchCommunities();
    }, [currentUser]);

    const toggleExpand = (section) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const renderCommunityCard = (community, role, gradientColor, badgeColor, badgeBg) => {
        const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB0m0WKgiHeRXLlQYjP5QjJVqH0JZmnkBfXXM86C2-Jx3UQSMuJdsFNGrv7ZTmST732LywSFhdFxp3anGFvJfVuXe8WYAutO6TJC23I2p441snqs4pKXewK6S6rpVpmHMxYElYiUurNqvP8f86vW-fw10n7WTF-q86s8KsToEqnVfTBivF5yLCo-h3x8kjObJEqi3zkPzugUcJUOEfYM681_rpfH9WMvP2cvONysO8MpRoZR3m2Y6C2xXdswIgxX2_KDFWf4HXR6J3j";
        const imageToUse = community.image || fallbackImage;

        return (
            <div
                key={community._id}
                className="flex-shrink-0 w-[380px] h-[140px] rounded-xl bg-white dark:bg-white/5 backdrop-blur-[12px] border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-violet-300 dark:hover:border-white/20"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${gradientColor} p-[2px]`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center">
                            {community.image ? (
                                <img alt={community.name} className="w-full h-full object-cover" src={community.image} />
                            ) : (
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{community.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate w-40">{community.name}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider ${badgeColor} ${badgeBg} px-2 py-0.5 rounded-full font-mono`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span> {role}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/community/${community._id}`)}
                    aria-label="Enter Studio" 
                    className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center transition-colors ${role === 'Admin' ? 'group-hover:bg-violet-500 group-hover:text-white' : 'group-hover:bg-cyan-400 group-hover:text-zinc-950'}`}
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <div className="w-full">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Communities</h1>
                    <p className="text-base text-slate-600 dark:text-gray-400 max-w-2xl">Manage your creative studios, collaborate with peers, and track your active hub memberships.</p>
                </div>
            </header>

            <div className="flex flex-col gap-12">
                {/* Section 1: Managed by Me */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-violet-500 dark:text-violet-400 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Managed by Me</h2>
                        </div>
                        {managed.length > 2 && (
                            <button onClick={() => toggleExpand('managed')} className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                                {expandedSection === 'managed' ? 'Show Less' : 'View All'}
                            </button>
                        )}
                    </div>
                    <div className={`flex gap-6 pb-8 px-2 -mx-2 ${expandedSection === 'managed' ? 'flex-wrap' : 'overflow-x-auto no-scrollbar'}`}>
                        {/* Create New Studio Action Card */}
                        <div 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-shrink-0 w-[300px] h-[140px] rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-violet-400 dark:hover:border-violet-500/50 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-md flex flex-col justify-center items-center gap-3 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center shadow-sm dark:shadow-lg group-hover:scale-110 transition-transform">
                                <Plus className="text-violet-600 dark:text-white w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors relative z-10">Launch New Studio</span>
                        </div>

                        {managed.map((community) =>
                            renderCommunityCard(
                                community,
                                'Admin',
                                'from-rose-500 to-violet-500',
                                'text-rose-400',
                                'bg-rose-400/10'
                            )
                        )}
                    </div>
                </section>

                {/* Section 2: Active Hubs */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="text-cyan-500 dark:text-cyan-400 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Hubs</h2>
                        </div>
                        {joined.length > 3 && (
                            <button onClick={() => toggleExpand('joined')} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                {expandedSection === 'joined' ? 'Show Less' : 'View All'}
                            </button>
                        )}
                    </div>
                    <div className={`flex gap-6 pb-8 px-2 -mx-2 ${expandedSection === 'joined' ? 'flex-wrap' : 'overflow-x-auto no-scrollbar'}`}>
                        {joined.length > 0 ? joined.map((community) =>
                            renderCommunityCard(
                                community,
                                'Member',
                                'from-cyan-400 to-violet-500',
                                'text-cyan-400',
                                'bg-cyan-400/10'
                            )
                        ) : (
                            <div className="w-full max-w-2xl rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                                <Users className="w-10 h-10 text-slate-300 dark:text-white/30 mb-3" />
                                <p className="text-slate-500 dark:text-gray-400">You haven't joined any hubs yet.</p>
                                <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">Explore communities to find your next creative space.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 3: Pending Approvals */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Clock className="text-slate-400 dark:text-gray-400 w-6 h-6" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Approvals</h2>
                        </div>
                        {pending.length > 3 && (
                            <button onClick={() => toggleExpand('pending')} className="text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors">
                                {expandedSection === 'pending' ? 'Show Less' : 'View All'}
                            </button>
                        )}
                    </div>
                    
                    {pending.length > 0 ? (
                        <div className={`flex gap-6 pb-8 px-2 -mx-2 ${expandedSection === 'pending' ? 'flex-wrap' : 'overflow-x-auto no-scrollbar'}`}>
                            {pending.map((community) => (
                                <div
                                    key={community._id}
                                    className="flex-shrink-0 w-[380px] h-[140px] rounded-xl bg-white dark:bg-white/5 backdrop-blur-[12px] border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-gray-500 dark:to-gray-700 p-[2px]">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center">
                                                {community.image ? (
                                                    <img alt={community.name} className="w-full h-full object-cover opacity-50" src={community.image} />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-500 dark:text-gray-500">{community.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-700 dark:text-gray-300 mb-1 truncate w-40">{community.name}</h3>
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-400/10 px-2 py-0.5 rounded-full font-mono">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-gray-400"></span> Pending
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        disabled
                                        aria-label="Awaiting Approval" 
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 flex items-center justify-center cursor-not-allowed"
                                    >
                                        <Clock className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-white/30 mb-3" />
                            <p className="text-slate-500 dark:text-gray-400">You're all caught up.</p>
                            <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">No pending invitations.</p>
                        </div>
                    )}
                </section>
            </div>

            <CreateCommunityModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCommunityCreated={(newCommunity) => {
                    setManaged(prev => [newCommunity, ...prev]);
                }}
            />
        </div>
    );
};

export default MyCommunities;