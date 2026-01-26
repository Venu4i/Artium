import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
    })
};

const FeedCard = ({ artwork, index }) => {
    return (
        <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className="group relative break-inside-avoid mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-xl"
        >
            {/* Image */}
            <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />

            {/* Glass Overlay (Visible on Hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-white font-bold text-lg leading-tight truncate">{artwork.title}</h3>

                <div className="flex items-center justify-between mt-3">
                    {/* Author Info */}
                    <div className="flex items-center gap-2">
                        <img
                            src={artwork.owner?.profilePicture || `https://ui-avatars.com/api/?name=${artwork.owner?.username}`}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full border border-white/20"
                        />
                        <span className="text-xs text-slate-300 font-medium truncate max-w-[80px]">
                            {artwork.owner?.username}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4 text-pink-500" />
                            <span className="text-xs text-white font-bold">{artwork.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-white font-bold">{artwork.comments?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-violet-600 hover:border-violet-600 transition-colors"
                >
                    View Details
                </motion.button>
            </div>
        </motion.div>
    );
};

export default FeedCard;