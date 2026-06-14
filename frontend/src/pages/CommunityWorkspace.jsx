import React, { useState, useEffect, useRef } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { chatService } from "../services/chatService";
import communityService from "../services/communityService";
import { useSocket } from "../context/SocketContext";
import AdminManagementDrawer from "../components/AdminManagementDrawer";
import EditCommunityModal from "../components/EditCommunityModal";

const CommunityWorkspace = () => {
    const { id } = useParams();
    const { community, currentUser } = useOutletContext();
    const socket = useSocket();
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [activeDrawerTab, setActiveDrawerTab] = useState(null); // 'requests', 'invites', 'members', null
    
    // Create a local state clone of community to handle optimistic updates for requests
    const [localCommunity, setLocalCommunity] = useState(community);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Initial messages fetch
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const chatRes = await chatService.getMessages(undefined, id);
                setMessages(chatRes.data || chatRes || []);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();
    }, [id]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !id) return;
        socket.emit("join-community", id);

        const handleNewMessage = (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        };

        socket.on("new-message", handleNewMessage);
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [socket, id]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        socket.emit("send-community-message", { 
            communityId: id, 
            content: input 
        });
        
        setInput("");
    };

    const handleAcceptRequest = async (reqUserId) => {
        try {
            await communityService.handleJoinRequest(id, reqUserId, "approve");
            setLocalCommunity(prev => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter(req => (req._id || req) !== reqUserId),
                members: [...prev.members, reqUserId]
            }));
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleRejectRequest = async (reqUserId) => {
        try {
            await communityService.handleJoinRequest(id, reqUserId, "reject");
            setLocalCommunity(prev => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter(req => (req._id || req) !== reqUserId)
            }));
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const isAdmin = String(localCommunity?.admin?._id || localCommunity?.admin) === String(currentUser?._id);

    return (
        <div className="flex-1 flex overflow-hidden relative z-10 h-full">
            
            {/* Central Workspace Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full h-full min-h-0">
                
                {/* HEADER: Expanded Cover Banner */}
                <div className="relative h-48 w-full shrink-0 group">
                    <div className="absolute inset-0 bg-community-container-lowest">
                        <img 
                            alt="Community Cover" 
                            className="w-full h-full object-cover opacity-60" 
                            src={localCommunity?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-community-background via-transparent to-transparent"></div>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setIsEditModalOpen(true)} className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-body-sm font-data-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 active:scale-95">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit Cover
                        </button>
                    )}
                    
                    {/* Avatar & Identity overlaying bottom of banner */}
                    <div className="absolute -bottom-10 left-4 md:left-10 flex items-end gap-6 w-full max-w-4xl pr-4 md:pr-10">
                        <div className="relative w-[88px] h-[88px] rounded-2xl bg-community-container-highest border-2 border-community-background shadow-xl overflow-hidden group/avatar cursor-pointer">
                            <img 
                                alt="Community Avatar" 
                                className="w-full h-full object-cover" 
                                src={localCommunity?.avatar || "https://res.cloudinary.com/demo/image/upload/v1633535288/sample.jpg"}
                            />
                            {isAdmin && (
                                <div onClick={() => setIsEditModalOpen(true)} className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-community-secondary">edit</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pb-1">
                            <div onClick={() => isAdmin && setIsEditModalOpen(true)} className={`flex items-center gap-2 group/title w-max ${isAdmin ? 'cursor-text border-b border-transparent hover:border-black/20 dark:hover:border-white/20' : ''} pb-1 transition-colors`}>
                                <h1 className="font-headline text-[32px] text-community-on-surface leading-none">
                                    {localCommunity?.name || "Community"}
                                </h1>
                                {isAdmin && <span className="material-symbols-outlined text-community-on-surface-variant text-[18px] opacity-0 group-hover/title:opacity-100 transition-opacity">edit</span>}
                            </div>
                            <div onClick={() => isAdmin && setIsEditModalOpen(true)} className={`flex items-center gap-2 group/desc w-max ${isAdmin ? 'cursor-text border-b border-transparent hover:border-black/20 dark:hover:border-white/20' : ''} pb-0.5 transition-colors mt-1`}>
                                <p className="font-body text-community-on-surface-variant">{localCommunity?.description || "Unleash your imagination."}</p>
                                {isAdmin && <span className="material-symbols-outlined text-community-on-surface-variant text-[14px] opacity-0 group-hover/desc:opacity-100 transition-opacity">edit</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROL BAR */}
                <div className="mt-12 px-4 md:px-10 shrink-0 flex justify-center">
                    <div className="glass-panel rounded-full px-2 py-2 inline-flex items-center shadow-lg">
                        <div className="flex items-center justify-center gap-4">
                            {isAdmin ? (
                                <button 
                                    onClick={() => setActiveDrawerTab(activeDrawerTab === 'requests' ? null : 'requests')}
                                    className={`px-4 py-1.5 rounded-full text-body-sm font-data-mono transition-colors flex items-center gap-2 ${activeDrawerTab === 'requests' ? 'bg-black/10 dark:bg-white/10 text-community-on-surface' : 'text-community-on-surface hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">group_add</span>
                                    Requests
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setActiveDrawerTab(activeDrawerTab === 'recentActivity' ? null : 'recentActivity')}
                                    className={`px-4 py-1.5 rounded-full text-body-sm font-data-mono transition-colors flex items-center gap-2 ${activeDrawerTab === 'recentActivity' ? 'bg-black/10 dark:bg-white/10 text-community-on-surface' : 'text-community-on-surface hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    Activity
                                </button>
                            )}
                            <button 
                                onClick={() => setActiveDrawerTab(activeDrawerTab === 'invites' ? null : 'invites')}
                                className={`px-4 py-1.5 rounded-full text-body-sm font-data-mono transition-colors flex items-center gap-2 ${activeDrawerTab === 'invites' ? 'bg-black/10 dark:bg-white/10 text-community-on-surface' : 'text-community-on-surface hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Invites
                            </button>
                            <button 
                                onClick={() => setActiveDrawerTab(activeDrawerTab === 'members' ? null : 'members')}
                                className={`px-4 py-1.5 rounded-full text-body-sm font-data-mono transition-colors flex items-center gap-2 ${activeDrawerTab === 'members' ? 'bg-black/10 dark:bg-white/10 text-community-on-surface' : 'text-community-on-surface hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">group</span>
                                Members
                            </button>
                        </div>
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className="flex-1 min-h-0 mt-2 px-4 md:px-10 pb-6 flex flex-col overflow-hidden">
                    
                    {/* Chat Scroll Area */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-6 pt-4 pb-4 pr-2 no-scrollbar">
                        {messages && messages.length > 0 ? (
                            messages.map((msg, index) => {
                                const isMe = String(msg.sender?._id || msg.sender) === String(currentUser?._id);
                                const isMod = msg.sender?.role === 'moderator';
                                const isAd = msg.sender?.role === 'admin';

                                return (
                                    <div key={index} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'} group`}>
                                        
                                        {!isMe && (
                                            <div className="flex items-center gap-2 mb-1 pl-1">
                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                    <img 
                                                        src={msg.sender?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.username || 'user'}`} 
                                                        alt="avatar" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className={`text-[13px] font-bold tracking-wide ${isAd ? 'bg-clip-text text-transparent bg-gradient-to-r from-community-tertiary to-community-secondary' : isMod ? 'text-emerald-400' : 'text-community-on-surface-variant'}`}>
                                                    {msg.sender?.username || 'Unknown'}
                                                </span>
                                                {isAd && <span className="material-symbols-outlined text-[12px] text-community-secondary">verified</span>}
                                            </div>
                                        )}

                                        <div className={`px-4 py-3 rounded-2xl relative group-hover:shadow-md transition-shadow ${
                                            isMe 
                                                ? 'bg-community-tertiary/20 text-community-on-surface border border-community-tertiary/30 rounded-br-none' 
                                                : 'glass-card-community text-community-on-surface rounded-bl-none'
                                        }`}>
                                            <p className="font-body text-sm leading-relaxed">{msg.content || msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="m-auto text-center opacity-50 flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined text-4xl text-community-on-surface-variant">forum</span>
                                <p className="font-data-mono text-sm text-community-on-surface-variant">The workspace is quiet. Start the conversation.</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input (Sticky at bottom of flex container) */}
                    <div className="shrink-0 pt-4 relative z-10">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message the workspace..."
                                className="w-full bg-black/20 dark:bg-white/5 backdrop-blur-xl border border-community-outline/20 rounded-full pl-6 pr-14 py-4 text-community-on-surface placeholder-community-on-surface-variant focus:outline-none focus:border-community-tertiary/50 transition-colors shadow-lg"
                            />
                            <button 
                                type="submit" 
                                disabled={!input?.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-community-tertiary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Admin/Member Management Drawer */}
            <AdminManagementDrawer 
                activeTab={activeDrawerTab} 
                community={localCommunity} 
                currentUser={currentUser}
                onClose={() => setActiveDrawerTab(null)}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
            />

            <EditCommunityModal
                isOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                community={localCommunity}
                setCommunity={setLocalCommunity}
            />
        </div>
    );
};

export default CommunityWorkspace;
