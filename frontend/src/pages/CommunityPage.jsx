import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import communityService from "../services/communityService";
import { chatService } from "../services/chatService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { getSafeId,isSameUser } from "../utils/idHelper";
import { useSelector } from "react-redux";

const CommunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();

    const [community, setCommunity] = useState({});
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state) => state.auth.user); // Check if it's .user or .currentUser
    const userId = currentUser?._id; 
    
    console.log("🕵️ RE-CHECKING ID:", userId);
    const messagesEndRef = useRef(null);

    if (!currentUser?._id && !isCheckingAuth) {
        return <div className="h-screen bg-zinc-950 flex items-center justify-center text-white">Authenticating...</div>;
    }
    useEffect(() => {
        const fetchCommunityData = async () => {
            try {
                setLoading(true);
                // Clear old state so we don't see the previous community while loading
                setCommunity({}); 
        
                const res = await communityService.getCommunity(id);
                
                // 1. Get the data
                const rawData = res?.data || res;
                
                // 2. CHECK: If it's an array, find the community that matches our URL ID
                // This prevents the "Top Community" bug.
                let normalizedData;
                if (Array.isArray(rawData)) {
                    normalizedData = rawData.find(c => String(c._id) === String(id));
                } else {
                    normalizedData = rawData;
                }
        
                console.log("📍 Fixed Community Object:", normalizedData);
                
                if (!normalizedData) throw new Error("Community not found");
        
                setCommunity(normalizedData);
        
                const chatRes = await chatService.getMessages(undefined, id);
                setMessages(chatRes.data || chatRes || []);
            } catch (error) {
                console.error("❌ Fetch Error:", error);
                navigate("/communities");
            } finally {
                setLoading(false);
            }
        };
    
        fetchCommunityData();
    }, [id, navigate]);
    
    // 2. Handle Socket connection separately
    useEffect(() => {
        if (!socket || !id) return;
    
        // Join the room
        console.log("📢 Joining room:", id);
        socket.emit("join-community", id);
    
        // Listen for messages
        const handleNewMessage = (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        };
    
        socket.on("new-message", handleNewMessage);
    
        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [socket, id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        console.log("Button clicked!"); // LOG 1
        
        if (!input.trim()) {
            console.log("Input is empty"); // LOG 2
            return;
        }
    
        if (!socket) {
            console.log("Socket is NOT connected!"); // LOG 3
            alert("Chat connection is lost. Please refresh.");
            return;
        }
    
        console.log("Sending message to room:", id); // LOG 4
        socket.emit("send-community-message", { 
            communityId: id, 
            content: input 
        });
        
        setInput("");
    };

    const handleGenerateInviteLink = async () => {
        try {
            const inviteLink = await communityService.generateInviteLink(id, currentUser.email);
            await navigator.clipboard.writeText(inviteLink);
            alert("Invite link copied to clipboard!");
        } catch (error) {
            console.error("Error generating invite link:", error);
        }
    };

    const handleJoinRequest = async (reqUserId, status) => {
        try {
            await communityService.handleJoinRequest(id, reqUserId, status);
            setCommunity((prev) => ({
                ...prev,
                pendingRequests: prev.pendingRequests.filter((req) => req._id !== reqUserId),
            }));
        } catch (error) {
            console.error("Error handling join request:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    console.log("🕵️ Admin Check:", {
        communityAdminId: community?.admin,
        currentUserId: currentUser?._id,
        match: String(community?.admin) === String(currentUser?._id)
    });
    if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="h-screen bg-zinc-950 pt-20 pb-10 px-6 flex gap-6">
            <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem]">
            <div className="p-6 flex justify-between items-center border-b border-white/10">
                <h1 className="text-2xl font-bold text-white">{community?.name || "Loading Studio..."}</h1>
                
                {(community?.members?.some(m => String(m) === String(currentUser?._id)) || 
                String(community?.admin) === String(currentUser?._id)) && (
                    <button
                        onClick={handleGenerateInviteLink}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                        Generate Invite Link
                    </button>
                )}
            </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages && messages.length > 0 ? (
                    messages.map((msg, index) => {
                        // SAFELY check if the message is from me using String() and ?._id
                        const isMe = String(msg.sender?._id || msg.sender) === String(currentUser?._id);
                        
                        return (
                            <motion.div
                                key={msg._id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`p-3 px-5 rounded-2xl max-w-xs shadow-xl transition-all ${
                                    isMe 
                                    ? 'bg-violet-600 text-white rounded-tr-none shadow-violet-900/20' 
                                    : 'bg-white/10 backdrop-blur-md text-slate-200 border border-white/5 rounded-tl-none'
                                }`}>
                                    {/* Only show the username if the message is NOT from me */}
                                    {!isMe && (
                                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                                            {msg.sender?.username || msg.sender?.name || "Artist"}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content || msg.text}</p>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 italic space-y-2">
                        <p>No messages yet.</p>
                        <p className="text-sm">Be the first to say hello!</p>
                    </div>
                )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg"
                        placeholder="Type your message..."
                    />
                    <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
                        Send
                    </button>
                </form>

                {/* Future Gamification UI injection */}

            </div>
            {/* Admin Panel Sidebar - Only visible to the owner */}
            {String(community?.admin?._id || community?.admin) === String(currentUser?._id) && (
                <div className="w-80 border-l border-white/10 bg-black/20 p-4">
                    <h2 className="text-xl font-bold text-white mb-4">Admin Panel</h2>
                    
                    {/* LOGGING THE REQUESTS FOR DEBUGGING */}
                    {console.log("DEBUG - Pending Requests Array:", community?.pendingRequests)}

                    {community?.pendingRequests && community.pendingRequests.length > 0 ? (
                        community.pendingRequests.map((request, index) => {
                            // Determine if request is a populated object or just an ID string
                            const requestId = request?._id || request;
                            
                            // Use fallback 'Artist' if username isn't populated yet
                            const displayName = request?.username || request?.name || `Artist ${index + 1}`;
                            const displayAvatar = request?.avatar || "";

                            return (
                                <div 
                                    key={String(requestId)} 
                                    className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/10">
                                            {displayAvatar ? (
                                                <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                displayName[0]?.toUpperCase()
                                            ) }
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">{displayName}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Requesting Join</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleJoinRequest(String(requestId), "approve")}
                                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            title="Approve"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </button>
                                        <button
                                            onClick={() => handleJoinRequest(String(requestId), "reject")}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            title="Reject"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <p className="text-white text-sm italic">No pending requests</p>
                            <p className="text-[10px] text-zinc-400 mt-1">Check back later</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityPage;