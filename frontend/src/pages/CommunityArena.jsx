import React, { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import challengeService from "../services/challengeService";
import SubmitWorkModal from "../components/SubmitWorkModal";
import CreateChallengeModal from "../components/CreateChallengeModal";
import ReviewQueue from "../components/ReviewQueue";

const CommunityArena = () => {
    const { id } = useParams();
    const { community, currentUser } = useOutletContext();
    const isAdmin = String(community?.admin?._id || community?.admin) === String(currentUser?._id);
    
    const [challenges, setChallenges] = useState([]);
    const [userSubmissions, setUserSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [activeChallengeForSubmit, setActiveChallengeForSubmit] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedChallengeForReview, setSelectedChallengeForReview] = useState(null);

    const fetchArenaData = async () => {
        try {
            setIsLoading(true);
            const [challengesRes, submissionsRes] = await Promise.all([
                challengeService.getCommunityChallenges(id),
                challengeService.getUserSubmissions(id)
            ]);
            
            setChallenges(challengesRes.data || challengesRes || []);
            setUserSubmissions(submissionsRes.data || submissionsRes || []);
        } catch (error) {
            console.error("Failed to load arena data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchArenaData();
        }
    }, [id]);

    const handleOpenSubmitModal = (challenge) => {
        setActiveChallengeForSubmit(challenge);
        setIsSubmitModalOpen(true);
    };

    const getSubmissionForChallenge = (challengeId) => {
        return userSubmissions.find(sub => String(sub.challengeId) === String(challengeId));
    };

    const activeChallenges = challenges.filter(c => c.status === "ACTIVE");
    const pastChallenges = challenges.filter(c => c.status !== "ACTIVE");

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-community-tertiary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full h-full pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-10 pt-10 space-y-10">
                
                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-community-outline/10 pb-8 mb-8">
                    <div>
                        <h1 className="font-headline text-[40px] md:text-[48px] text-community-on-surface font-bold flex items-center gap-4 leading-tight">
                            <span className="relative flex h-4 w-4 shrink-0 mt-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-community-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-community-secondary"></span>
                            </span>
                            Arena Challenges
                        </h1>
                        <p className="text-community-on-surface-variant text-[16px] mt-2">
                            {isAdmin ? "Manage, monitor, and review community creative sprints." : "Participate in community creative sprints."}
                        </p>
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-community-secondary to-pink-500 px-8 py-3 rounded-full font-bold text-white shadow-[0_0_20px_rgba(255,176,205,0.3)] hover:shadow-[0_0_30px_rgba(255,176,205,0.5)] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Challenge
                        </button>
                    )}
                </div>

                {selectedChallengeForReview ? (
                    <ReviewQueue 
                        challenge={selectedChallengeForReview} 
                        onBack={() => {
                            setSelectedChallengeForReview(null);
                            fetchArenaData();
                        }} 
                    />
                ) : (
                    <>
                        {/* SECTION 1: ACTIVE CHALLENGES */}
                        <section>
                            <div className="flex items-center gap-3 mb-8 border-l-4 border-community-secondary pl-4">
                                <h2 className="font-headline text-[28px] font-bold text-community-on-surface tracking-tight">Active Challenges</h2>
                            </div>

                    {activeChallenges.length === 0 ? (
                        <div className="text-community-on-surface-variant italic">No active challenges at the moment.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {activeChallenges.map(challenge => {
                                const submission = getSubmissionForChallenge(challenge._id);
                                const hasSubmitted = !!submission;
                                
                                const timeRemaining = new Date(challenge.deadline).getTime() - new Date().getTime();
                                const daysLeft = Math.ceil(timeRemaining / (1000 * 3600 * 24));
                                const timeLeftText = daysLeft > 1 ? `${daysLeft} days` : daysLeft === 1 ? '1 day' : 'Ends today';

                                return (
                                    <div key={challenge._id} className="glass-card rounded-xl overflow-hidden flex flex-col h-full group">
                                        <div className="relative h-48 w-full bg-community-container-highest overflow-hidden">
                                            {/* Default challenge placeholder image */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-community-on-surface-variant/20">architecture</span>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-community-container-lowest via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[14px] font-bold rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">ACTIVE</span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="font-headline text-[24px] font-bold text-community-on-surface mb-1 truncate">{challenge.title}</h3>
                                                <p className="text-community-on-surface-variant text-[14px] truncate">{challenge.description}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="flex flex-col">
                                                    <span className="text-community-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Reward</span>
                                                    <span className="text-community-secondary font-data-mono text-[14px] font-bold">{challenge.maxPoints} pts</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-community-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Time Left</span>
                                                    <span className={`${daysLeft <= 1 ? 'text-orange-400 animate-pulse' : 'text-community-on-surface'} font-data-mono text-[14px] font-bold`}>{timeLeftText}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-community-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Submissions</span>
                                                    <span className="text-community-on-surface font-data-mono text-[14px] font-bold">{challenge.submissionsCount || 0} users</span>
                                                </div>
                                            </div>
                                            
                                            {isAdmin ? (
                                                <button 
                                                    onClick={() => setSelectedChallengeForReview(challenge)}
                                                    className="mt-auto w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                                                >
                                                    View Submissions
                                                </button>
                                            ) : hasSubmitted ? (
                                                <div className="mt-auto w-full py-4 bg-community-tertiary/20 text-community-tertiary font-bold rounded-lg border border-community-tertiary/20 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.2)]">
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Submitted — Pending Review
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleOpenSubmitModal(challenge)}
                                                    className="mt-auto w-full py-4 bg-gradient-to-r from-community-secondary to-pink-500 text-white font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(255,176,205,0.3)] hover:shadow-[0_0_25px_rgba(255,176,205,0.5)]"
                                                >
                                                    Submit Your Work
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* SECTION 2: PAST CHALLENGES */}
                <section>
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-community-outline/20 pl-4 opacity-80">
                        <h2 className="font-headline text-[28px] font-bold text-community-on-surface tracking-tight">Past Challenges</h2>
                    </div>

                    {pastChallenges.length === 0 ? (
                        <div className="text-community-on-surface-variant italic opacity-60">No past challenges.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pastChallenges.map(challenge => {
                                const submission = getSubmissionForChallenge(challenge._id);
                                const isApproved = submission?.status === 'approved';
                                const isRejected = submission?.status === 'rejected';

                                return (
                                    <div key={challenge._id} className="glass-card rounded-xl p-6 opacity-70 hover:opacity-100 transition-opacity flex flex-col justify-center">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-community-container-highest flex-shrink-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-2xl text-community-on-surface-variant/40">emoji_events</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-headline text-[18px] text-community-on-surface font-bold">{challenge.title}</h3>
                                                    <p className="text-community-on-surface-variant text-[14px]">Challenge Ended</p>
                                                </div>
                                            </div>
                                            
                                            {isAdmin ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setSelectedChallengeForReview(challenge)}
                                                        className="px-4 py-2 bg-community-tertiary/20 text-community-tertiary text-[14px] font-bold rounded-full border border-community-tertiary/30 hover:bg-community-tertiary/30 shrink-0 transition-colors"
                                                    >
                                                        Review History
                                                    </button>
                                                </div>
                                            ) : submission ? (
                                                isApproved ? (
                                                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[14px] font-bold rounded-full border border-emerald-500/20 shrink-0">
                                                        You earned {submission.pointsAwarded || 0} pts
                                                    </div>
                                                ) : isRejected ? (
                                                    <div className="px-4 py-2 bg-red-500/10 text-red-400 text-[14px] font-bold rounded-full border border-red-500/20 shrink-0">
                                                        Not approved
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-2 bg-yellow-500/10 text-yellow-500 text-[14px] font-bold rounded-full border border-yellow-500/20 shrink-0">
                                                        Pending Review
                                                    </div>
                                                )
                                            ) : (
                                                <div className="px-4 py-2 bg-black/10 dark:bg-white/5 text-community-on-surface-variant text-[14px] font-bold rounded-full border border-community-outline/10 shrink-0">
                                                    Did not participate
                                                </div>
                                            )}
                                        </div>

                                        {isRejected && submission.rejectionNote && (
                                            <div className="bg-community-container-highest/50 p-4 rounded-lg border-l-4 border-red-500 mt-4">
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-sm text-red-400 mt-0.5">info</span>
                                                    <p className="text-community-on-surface-variant text-[14px] italic">"{submission.rejectionNote}" — Admin</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
                </>
                )}
            </div>

            <SubmitWorkModal 
                isOpen={isSubmitModalOpen}
                onClose={() => {
                    setIsSubmitModalOpen(false);
                    setActiveChallengeForSubmit(null);
                }}
                challenge={activeChallengeForSubmit}
                onSuccess={() => {
                    fetchArenaData();
                }}
            />

            <CreateChallengeModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchArenaData();
                }}
            />
        </div>
    );
};

export default CommunityArena;
