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
            // RESPONSIVE: Reduced mb-8 to mb-4 on mobile
            className="group relative break-inside-avoid mb-4 md:mb-8 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-lg cursor-pointer"
        >
            {/* 1. Bigger, Clearer Image */}
            <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
            />

            {/* 2. Overlay - Only visible on hover (or focus on mobile) */}
            {/* RESPONSIVE: Reduced padding p-5 to p-3 on mobile. Added focus-within for touch devices. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-5">

                <div className="flex justify-between items-end">
                    <div className="min-w-0"> {/* min-w-0 helps truncate work in flex containers */}
                        {/* RESPONSIVE: text-base on mobile, text-lg on desktop */}
                        <h3 className="text-white font-bold text-base md:text-lg truncate pr-2">{artwork.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {/* RESPONSIVE: Smaller avatar on mobile */}
                            <img
                                src={artwork.owner?.profilePicture}
                                className="w-4 h-4 md:w-5 md:h-5 rounded-full"
                                alt=""
                            />
                            <span className="text-xs text-slate-300 font-medium truncate">{artwork.owner?.username}</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1 text-white">
                            {/* RESPONSIVE: Smaller icon on mobile */}
                            <HeartIcon className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
                            <span className="text-xs font-bold">{artwork.likes?.length || 0}</span>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default FeedCard;