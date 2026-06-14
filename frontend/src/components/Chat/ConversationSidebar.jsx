import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const ConversationSidebar = ({ conversations, activeId, onSelect }) => {
  const { user: currentUser } = useAuth();
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {conversations.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-sm">
          No active canvases. Start a collaboration from an artist's profile!
        </div>
      ) : (
        conversations.map((conv) => {
          // Find the other participant (not the current user)
          const artist = conv.participants.find(p => p._id?.toString() !== currentUser?._id?.toString()) || conv.participants[0];
          const isActive = activeId === conv._id;

          return (
            <motion.div
              key={conv._id}
              whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              onClick={() => onSelect(conv)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${
                isActive ? 'border-violet-600 bg-white/5' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <img 
                  src={artist?.profilePicture || artist?.avatar || "https://ui-avatars.com/api/?name=" + (artist?.username || "A")} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  alt="avatar"
                />
                {conv.unreadCounts?.[artist?._id] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {conv.unreadCounts[artist._id]}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-semibold text-slate-100 truncate">{artist?.username}</h4>
                  <span className="text-[10px] text-slate-500">12:45 PM</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {conv.lastMessage?.content || "No messages yet..."}
                </p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default ConversationSidebar;