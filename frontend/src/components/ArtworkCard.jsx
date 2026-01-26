import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

const ArtworkCard = ({ artwork }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }} // Gentle lift effect
            className="break-inside-avoid mb-6 relative group rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-lg"
        >
            {/* 1. Image */}
            <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />

            {/* 2. Overlay (Appears on Hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

                {/* Title & Artist */}
                <h3 className="text-white font-bold text-lg truncate">{artwork.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <img
                        src={artwork.owner?.profilePicture || "https://ui-avatars.com/api/?background=random"}
                        alt={artwork.owner?.username}
                        className="w-5 h-5 rounded-full border border-white/50"
                    />
                    <span className="text-xs text-slate-300 font-medium">{artwork.owner?.username}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-pink-500">
                        <HeartIcon className="w-4 h-4" />
                        <span className="text-xs font-bold text-white">{artwork.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span className="text-xs font-bold text-white">{artwork.comments?.length || 0}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ArtworkCard;