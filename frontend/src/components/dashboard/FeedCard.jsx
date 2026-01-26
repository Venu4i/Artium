import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

const FeedCard = ({ artwork, index, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => onClick(artwork)}
            className="group relative break-inside-avoid mb-8 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-lg cursor-pointer"
        >
            {/* 1. Bigger, Clearer Image */}
            <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
            />

            {/* 2. Overlay - Only visible on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">

                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-white font-bold text-lg truncate pr-2">{artwork.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <img src={artwork.owner?.profilePicture} className="w-5 h-5 rounded-full" alt="" />
                            <span className="text-xs text-slate-300 font-medium">{artwork.owner?.username}</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1 text-white">
                            <HeartIcon className="w-4 h-4 text-pink-500" />
                            <span className="text-xs font-bold">{artwork.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default FeedCard;