import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import ConversationSidebar from '../components/Chat/ConversationSidebar';
import Chat from '../components/Chat/Chat.jsx';
import { useAuth } from '../hooks/useAuth';
import { UserPlusIcon , ChatBubbleLeftRightIcon} from '@heroicons/react/24/outline'; // v2 Icon

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [discoveryUsers, setDiscoveryUsers] = useState([]); // New state for connections
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch existing conversations
        const convData = await chatService.getMyConversations();
        setConversations(convData.data || []);

        // Fetch suggested users to connect with
        const discoveryData = await chatService.getDiscoveryUsers();
        setDiscoveryUsers(discoveryData.data || []);
      } catch (err) {
        console.error("❌ Failed to load Chroma Chat data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStartNewChat = async (targetUserId) => {
    try {
      const response = await chatService.getOrCreateConversation(targetUserId);
      const newConv = response.data;
      
      // Update conversations list if it's a brand new one
      if (!conversations.find(c => c._id === newConv._id)) {
        setConversations(prev => [newConv, ...prev]);
      }
      
      setActiveConversation(newConv);
      // Remove from discovery list once chat starts
      setDiscoveryUsers(prev => prev.filter(u => u._id !== targetUserId));
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-12 flex justify-between items-end">
          <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Messages</h1>
              <p className="text-base text-slate-600 dark:text-gray-400 max-w-2xl">Connect with other artists, manage your creative collaborations, and stay in touch.</p>
          </div>
      </header>

      <div className="w-full h-[calc(100vh-260px)] min-h-[500px] flex gap-6">
        {/* Left Sidebar Section */}
        <div className="w-80 md:w-96 flex flex-col bg-white dark:bg-white/5 backdrop-blur-[12px] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Conversations</h2>
          </div>
          {discoveryUsers.length > 0 && (
            <div className="p-4 mb-4 rounded-2xl bg-violet-50 dark:bg-violet-600/5 border border-violet-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3 px-2">
                <UserPlusIcon className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-tight">Suggested Artists</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {discoveryUsers.map(u => (
                  <button 
                    key={u._id}
                    onClick={() => handleStartNewChat(u._id)}
                    className="flex-shrink-0 flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 p-0.5 group-hover:border-violet-500 dark:group-hover:border-violet-400 transition-all bg-white dark:bg-transparent">
                      <img src={u.profilePicture || u.avatar} alt={u.username} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 group-hover:text-slate-900 dark:group-hover:text-white truncate w-12 text-center">
                        {(u.username || 'Artist').split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Existing Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-slate-500 text-sm">No active conversations.</p>
                <p className="text-xs text-slate-400 mt-1">Connect with artists above to start chatting.</p>
              </div>
            ) : (
              <ConversationSidebar 
                conversations={conversations} 
                activeId={activeConversation?._id}
                onSelect={setActiveConversation}
              />
            )}
          </div>
        </div>

        {/* Right Chat Canvas Section */}
        <div className="flex-1 flex flex-col bg-white dark:bg-white/5 backdrop-blur-[12px] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg rounded-2xl overflow-hidden">
          {activeConversation ? (
            <Chat
              activeConversation={activeConversation} 
              currentUser={user} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Your Workspace</h3>
              <p className="text-slate-500 text-sm max-w-xs mt-2">
                Select a conversation or start a new collaboration to begin your creative dialogue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;