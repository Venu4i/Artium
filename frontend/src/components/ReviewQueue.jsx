import React, { useState, useEffect } from "react";
import challengeService from "../services/challengeService";
import { formatDistanceToNow } from "date-fns";

const ReviewQueue = ({ challenge, onBack }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinalizing, setIsFinalizing] = useState(false);
    
    // Track remarks and points individually for each submission
    const [reviewStates, setReviewStates] = useState({});

    useEffect(() => {
        fetchDetails();
    }, [challenge._id]);

    const fetchDetails = async () => {
        try {
            setIsLoading(true);
            const res = await challengeService.getChallengeDetails(challenge._id);
            setSubmissions(res.data?.submissions || []);
            
            // Initialize states
            const initialStates = {};
            (res.data?.submissions || []).forEach(sub => {
                initialStates[sub._id] = {
                    pointsAwarded: sub.pointsAwarded || 0,
                    rejectionNote: sub.rejectionNote || ""
                };
            });
            setReviewStates(initialStates);
        } catch (error) {
            console.error("Failed to load submissions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async (submissionId, status) => {
        const state = reviewStates[submissionId];
        try {
            await challengeService.reviewSubmission(submissionId, {
                status,
                pointsAwarded: Number(state.pointsAwarded),
                rejectionNote: state.rejectionNote
            });
            await fetchDetails();
        } catch (error) {
            console.error("Failed to review", error);
            alert("Error: " + (error.response?.data?.message || "Failed to review"));
        }
    };

    const handleFinalize = async () => {
        try {
            setIsFinalizing(true);
            await challengeService.finalizeChallenge(challenge._id);
            onBack(); // Go back after finalizing
        } catch (error) {
            console.error("Failed to finalize", error);
            alert("Error: " + (error.response?.data?.message || "Failed to finalize challenge"));
        } finally {
            setIsFinalizing(false);
        }
    };

    const updateState = (submissionId, field, value) => {
        setReviewStates(prev => ({
            ...prev,
            [submissionId]: { ...prev[submissionId], [field]: value }
        }));
    };

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-community-outline/20 rounded w-3/4"></div></div></div>;
    }

    const reviewedCount = submissions.filter(s => s.status !== "pending").length;
    const totalCount = submissions.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((reviewedCount / totalCount) * 100);
    const canFinalize = totalCount > 0 && reviewedCount === totalCount;

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-community-on-surface-variant transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="font-headline text-[24px] font-bold text-community-on-surface">Review Queue</h2>
                        {totalCount - reviewedCount > 0 && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 rounded-full text-[12px] font-bold text-white uppercase tracking-wider">
                                {totalCount - reviewedCount} pending
                            </span>
                        )}
                    </div>
                    <div className="text-community-on-surface-variant font-data-mono flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">location_searching</span>
                        {challenge.title}
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-community-outline ml-2">
                            {challenge.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {submissions.length === 0 ? (
                    <div className="text-community-on-surface-variant italic opacity-60">No submissions yet.</div>
                ) : (
                    submissions.map(sub => {
                        const state = reviewStates[sub._id] || {};
                        const isPending = sub.status === "pending";
                        const isApproved = sub.status === "approved";
                        const isRejected = sub.status === "rejected";

                        return (
                            <div key={sub._id} className={`glass-card p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${isApproved ? 'border-emerald-500/30' : isRejected ? 'border-red-500/30' : 'hover:border-community-outline/30'}`}>
                                
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <img 
                                        alt="Submitter Avatar" 
                                        className={`w-12 h-12 rounded-full ring-2 ${isApproved ? 'ring-emerald-500/50' : isRejected ? 'ring-red-500/50' : 'ring-white/5'}`} 
                                        src={sub.submittedBy?.profilePicture || "https://ui-avatars.com/api/?name="+sub.submittedBy?.username}
                                    />
                                    <div>
                                        <p className="font-bold text-community-on-surface">{sub.submittedBy?.username}</p>
                                        <p className="text-xs text-community-outline font-data-mono">
                                            Sub: {formatDistanceToNow(new Date(sub.createdAt))} ago
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto h-40 md:h-24 rounded-xl overflow-hidden relative group bg-black/20">
                                    {sub.mediaUrl ? (
                                        <a href={sub.mediaUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">View Submission</span>
                                            </div>
                                            <img className="w-full h-full object-cover" src={sub.mediaUrl} alt="Submission" />
                                        </a>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-community-on-surface-variant text-sm">
                                            Content Submitted
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-[350px]">
                                    {isPending ? (
                                        <>
                                            <div className="flex gap-2 w-full">
                                                <div className="relative w-24">
                                                    <input 
                                                        className="w-full bg-black/40 border border-community-outline/20 rounded-lg py-2 px-3 text-center font-data-mono focus:border-community-tertiary focus:ring-0 transition-colors text-community-on-surface" 
                                                        max={challenge.maxPoints} 
                                                        placeholder="0" 
                                                        type="number"
                                                        value={state.pointsAwarded}
                                                        onChange={(e) => updateState(sub._id, 'pointsAwarded', e.target.value)}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-community-outline font-bold">PTS</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className="flex-1 bg-black/40 border border-community-outline/20 rounded-lg py-2 px-3 text-sm text-community-on-surface focus:border-community-tertiary focus:ring-0 transition-colors"
                                                    placeholder="Remarks / Note..."
                                                    value={state.rejectionNote}
                                                    onChange={(e) => updateState(sub._id, 'rejectionNote', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    onClick={() => handleReview(sub._id, "approved")}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 py-2 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReview(sub._id, "rejected")}
                                                    className="flex-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 py-2 rounded-lg font-bold text-sm transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-1 text-right items-end justify-center h-full">
                                            {isApproved ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="font-data-mono text-emerald-400 font-bold">{sub.pointsAwarded} PTS</div>
                                                    <div className="text-emerald-500 flex items-center gap-1 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        Approved
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="text-red-500 flex items-center gap-1 font-bold text-sm bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                                                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                        Rejected
                                                    </div>
                                                </div>
                                            )}
                                            {sub.rejectionNote && (
                                                <div className="text-xs text-community-outline italic">
                                                    "{sub.rejectionNote}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ReviewQueue;
