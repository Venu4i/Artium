import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useChat } from '../../hooks/useChat.js';

const Chat = ({ activeConversation, currentUser }) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef();
  
  // Find the artist we are talking to
  const targetArtist = activeConversation?.participants.find(p => p._id !== currentUser._id);
  
  const { messages, sendMessage } = useChat(
    activeConversation?._id, 
    targetArtist?._id
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Artist Header */}
      <header className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 p-[1.5px]">
             <img src={targetArtist?.avatar} className="w-full h-full rounded-full bg-zinc-900 object-cover" alt="artist" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold">{targetArtist?.username}</h3>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Collaborator</p>
          </div>
        </div>
      </header>

      {/* Message Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender === currentUser._id || msg.sender?._id === currentUser._id;
            return (
              <motion.div
                key={msg._id || Math.random()}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-3 px-5 rounded-2xl text-[14px] shadow-lg ${
                  isMe 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-zinc-800 text-slate-200 border border-white/10 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Chroma Input Bar (Telegram-Style) */}
      <div className="p-4 bg-gradient-to-t from-zinc-950 to-transparent">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-violet-500/50 transition-all backdrop-blur-2xl">
          <button type="button" className="p-2 text-slate-500 hover:text-violet-400 transition-colors">
            <PhotoIcon className="w-6 h-6" />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to collaborate..."
            className="flex-1 bg-transparent border-none text-slate-100 focus:ring-0 placeholder-slate-600 text-sm"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl shadow-lg shadow-violet-600/30 transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Chat;