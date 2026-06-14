import React, { useState, useEffect } from "react";
import communityService from "../services/communityService";
import { formatDistanceToNow } from "date-fns";

const AdminManagementDrawer = ({ 
    activeTab, 
    community, 
    currentUser, 
    onClose, 
    onAcceptRequest, 
    onRejectRequest 
}) => {
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);
    
    // Member search
    const [searchQuery, setSearchQuery] = useState("");
    
    // Activity state
    const [activity, setActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    useEffect(() => {
        if (activeTab === 'recentActivity' && community?._id) {
            fetchActivity();
        }
    }, [activeTab, community?._id]);

    const fetchActivity = async () => {
        try {
            setLoadingActivity(true);
            const res = await communityService.getCommunityActivity(community._id);
            setActivity(res.activity || []);
        } catch (error) {
            console.error("Failed to load community activity", error);
        } finally {
            setLoadingActivity(false);
        }
    };

    if (!activeTab) return null;

    const isAdmin = String(community?.admin?._id || community?.admin) === String(currentUser?._id);
    
    // Only admins or members can see the drawer
    const isMember = community?.members?.some(m => String(m._id || m) === String(currentUser?._id));
    if (!isAdmin && !isMember) return null;

    const handleGenerateInvite = async () => {
        try {
            const link = await communityService.generateInviteLink(community._id, currentUser.email);
            setInviteLink(link.inviteLink || link);
            setCopied(false);
        } catch (error) {
            console.error("Failed to generate invite link", error);
            alert("Failed to generate invite link.");
        }
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <aside className="w-80 border-l border-black/5 dark:border-white/5 bg-community-surface-dim/80 backdrop-blur-xl flex flex-col shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-headline text-[18px] text-community-on-surface flex items-center gap-2 capitalize">
                    <span className="material-symbols-outlined text-community-on-surface-variant">
                        {activeTab === 'members' ? 'group' : activeTab === 'requests' ? 'person_add' : activeTab === 'recentActivity' ? 'history' : 'mail'}
                    </span>
                    {activeTab === 'recentActivity' ? 'Recent Activity' : activeTab}
                </h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-community-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 drawer-scroll">
                
                {/* --- RECENT ACTIVITY TAB --- */}
                {activeTab === "recentActivity" && (
                    <div className="flex flex-col gap-4 p-2">
                        {loadingActivity ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-community-tertiary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : activity.length === 0 ? (
                            <p className="text-community-on-surface-variant text-sm text-center py-4">No recent activity.</p>
                        ) : (
                            <div className="relative border-l dark:border-amber-50 border-black/30 ml-3 flex flex-col gap-6 mt-2">
                                {activity.map((item, i) => (
                                    <div key={item._id} className="relative pl-6">
                                        <div className={`absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ${i % 2 === 0 ? 'bg-cyan-400' : 'bg-pink-400'}`}></div>
                                        <h5 className="text-community-on-surface text-[14px]">{item.message}</h5>
                                        <p className="text-community-on-surface-variant text-[12px] mt-1">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- MEMBERS TAB --- */}
                {activeTab === "members" && (() => {
                    const filtered = community.members?.filter(m => 
                        (m.username || "").toLowerCase().includes(searchQuery.toLowerCase())
                    ) || [];
                    
                    const adminId = String(community.admin?._id || community.admin);
                    const filteredAdmin = filtered.find(m => String(m._id || m) === adminId);
                    const filteredMembers = filtered.filter(m => String(m._id || m) !== adminId);

                    return (
                        <>
                            <div className="bg-community-container-highest rounded-lg flex items-center px-3 py-1.5 border border-black/5 dark:border-white/5 mb-4">
                                <span className="material-symbols-outlined text-community-on-surface-variant text-[16px] mr-2">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search members..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none text-body-sm text-community-on-surface w-full focus:ring-0 p-0 placeholder:text-community-on-surface-variant/50 outline-none"
                                />
                            </div>
                            
                            {filteredAdmin && (
                                <div className="mb-4">
                                    <h4 className="font-data-mono text-[11px] text-community-on-surface-variant mb-2 uppercase tracking-wider">Admin</h4>
                                    <div className="flex items-center justify-between group/member p-2 -mx-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img 
                                                    alt="Admin" 
                                                    src={filteredAdmin.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${filteredAdmin.username}`}
                                                    className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5 object-cover" 
                                                />
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border border-community-surface-dim"></div>
                                            </div>
                                            <div>
                                                <span className="font-body-sm text-amber-500 font-bold block leading-tight">
                                                    @{filteredAdmin.username || "Admin"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filteredMembers.length > 0 && (
                                <div>
                                    <h4 className="font-data-mono text-[11px] text-community-on-surface-variant mb-3 uppercase tracking-wider">Members — {filteredMembers.length}</h4>
                                    <div className="flex flex-col gap-1">
                                        {filteredMembers.map((member) => (
                                            <div key={member._id || member} className="flex items-center justify-between group/member p-2 -mx-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img 
                                                            alt="Member" 
                                                            src={member.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                                                            className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5 object-cover" 
                                                        />
                                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-community-surface-dim"></div>
                                                    </div>
                                                    <div>
                                                        <span className="font-body-sm text-community-on-surface block leading-tight">
                                                            @{member.username || "Member"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filtered.length === 0 && (
                                <p className="text-community-on-surface-variant text-sm text-center py-4">No members found.</p>
                            )}
                        </>
                    );
                })()}

                {/* --- REQUESTS TAB --- */}
                {activeTab === "requests" && (
                    <>
                        <h4 className="font-data-mono text-[11px] text-community-on-surface-variant mb-3 uppercase tracking-wider">Pending Requests — {community.pendingRequests?.length || 0}</h4>
                        {community.pendingRequests?.length === 0 ? (
                            <div className="text-center text-community-on-surface-variant mt-10">No pending requests</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {community.pendingRequests?.map((request, index) => {
                                    const requestId = request._id || request;
                                    const displayName = request.username || request.name || `Artist ${index + 1}`;
                                    const displayAvatar = request.profilePicture || request.avatar;

                                    return (
                                        <div key={String(requestId)} className="glass-panel p-3 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={displayAvatar || "https://res.cloudinary.com/demo/image/upload/v1633535288/sample.jpg"} 
                                                    className="w-8 h-8 rounded-full object-cover" 
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-community-on-surface text-sm font-medium">{displayName}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => onAcceptRequest(String(requestId))}
                                                    className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors"
                                                    title="Approve"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                </button>
                                                <button 
                                                    onClick={() => onRejectRequest(String(requestId))}
                                                    className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Reject"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* --- INVITES TAB --- */}
                {activeTab === "invites" && (
                    <>
                        <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
                            <h4 className="font-headline text-[14px] text-community-on-surface">Generate Invite Link</h4>
                            <p className="text-[12px] text-community-on-surface-variant">Create a unique link to invite new members. This link will expire in 7 days.</p>
                            <button 
                                onClick={handleGenerateInvite}
                                className="w-full py-2 bg-community-secondary text-white rounded-lg font-data-mono text-[12px] hover:opacity-90 transition-opacity mt-2"
                            >
                                Generate New Link
                            </button>

                            {inviteLink && (
                                <div className="mt-4 p-2 bg-community-container-highest border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-between">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={inviteLink}
                                        className="bg-transparent border-none text-[11px] text-community-on-surface w-full focus:ring-0 outline-none pr-2"
                                    />
                                    <button onClick={copyToClipboard} className="text-community-tertiary p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <h4 className="font-data-mono text-[11px] text-community-on-surface-variant mb-3 uppercase tracking-wider">Active Invites</h4>
                            <div className="flex flex-col gap-2">
                                {community.invites && community.invites.filter(i => i.status === 'pending').length > 0 ? (
                                    community.invites.filter(i => i.status === 'pending').map((invite, index) => (
                                        <div key={index} className="p-2 border border-black/5 dark:border-white/5 rounded-lg flex justify-between items-center">
                                            <span className="text-[12px] text-community-on-surface-variant truncate w-3/4">{invite.token}</span>
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded font-data-mono">Pending</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-[12px] text-community-on-surface-variant">No active pending invites</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </aside>
    );
};

export default AdminManagementDrawer;
