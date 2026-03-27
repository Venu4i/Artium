import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import communityService from "../services/communityService";
import { useAuth } from "../hooks/useAuth";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { getSafeId,isSameUser } from "../utils/idHelper";
import { useSelector } from "react-redux";

const MyCommunities = () => {
    const currentUser = useSelector((state) => state.auth.user); // Check if it's .user or .currentUser
    const [managed, setManaged] = useState([]);
    const [joined, setJoined] = useState([]);
    const [pending, setPending] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchCommunities = async () => {
            
            try {
                console.log("Fetching communities for user:", currentUser?._id);
                const response = await communityService.getMyCommunities();
                
                // 1. DATA EXTRACTION LOG
                console.log("RAW API RESPONSE:", response);
                const allData = Array.isArray(response) ? response : (response?.data || []);
                console.log("EXTRACTED ARRAY:", allData);

                const myId = String(currentUser?._id || "");
                console.log("MY USER ID:", myId);
        
                // 2. FILTERING WITH LOGS
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

                console.log("FILTER RESULTS:", { managed: managedCommunities.length, joined: joinedCommunities.length, pending: pendingCommunities.length });
        
                setManaged(managedCommunities);
                setJoined(joinedCommunities);
                setPending(pendingCommunities);
            } catch (error) {
                console.error("Dashboard Error:", error);
            }
        };

        if (currentUser) fetchCommunities();
    }, [currentUser]);

    const renderCommunityCard = (community, action) => (
        <div
            key={community._id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
        >
            <h3 className="text-lg font-semibold text-white">{community.name}</h3>
            <p className="text-sm text-gray-400">{community.description}</p>
            {action}
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 pt-20 px-6">
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Managed by Me</h2>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-violet-900/20 transition-all"
                    >
                        + Create New
                    </button>
                </div>
                {managed.length > 0 ? (
                    managed.map((community) =>
                        renderCommunityCard(
                            community,
                            <Link
                                to={`/community/${community._id}`}
                                className="mt-2 inline-block bg-violet-600 text-white px-4 py-2 rounded-lg"
                            >
                                Enter Studio
                            </Link>
                        )
                    )
                ) : (
                    <p className="text-gray-400">No communities managed by you.</p>
                )}
            </section>

            <section className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">Active Hubs</h2>
                {joined.length > 0 ? (
                    joined.map((community) =>
                        renderCommunityCard(
                            community,
                            <Link
                                to={`/community/${community._id}`}
                                className="mt-2 inline-block bg-violet-600 text-white px-4 py-2 rounded-lg"
                            >
                                Open Chat
                            </Link>
                        )
                    )
                ) : (
                    <p className="text-gray-400">No active hubs joined.</p>
                )}
            </section>

            <section className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">Pending Approvals</h2>
                {pending.length > 0 ? (
                    pending.map((community) =>
                        renderCommunityCard(
                            community,
                            <button
                                disabled
                                className="mt-2 inline-block bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                            >
                                Awaiting Approval
                            </button>
                        )
                    )
                ) : (
                    <p className="text-gray-400">No pending approvals.</p>
                )}
            </section>

            <CreateCommunityModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCommunityCreated={(newCommunity) => {
                    // Automatically add the newly created community to the "Managed" list in the UI
                    setManaged(prev => [newCommunity, ...prev]);
                }}
            />
        </div>
    );
};

export default MyCommunities;