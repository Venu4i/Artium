import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const FeedCard = ({ artwork, index, onClick, onLike, disabledLike }) => {
    const liked = artwork.likedByMe === true;
    const likeCount = Array.isArray(artwork.likes) ? artwork.likes.length : 0;

    const handleHeartClick = (e) => {
        e.stopPropagation();
        if (onLike && !disabledLike) onLike(artwork);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => onClick(artwork)}
            className="group relative break-inside-avoid mb-4 md:mb-8 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-lg cursor-pointer"
        >
            <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-5">

                <div className="flex justify-between items-end">
                    <div className="min-w-0">
                        <h3 className="text-white font-bold text-base md:text-lg truncate pr-2">{artwork.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <img
                                src={artwork.owner?.profilePicture}
                                className="w-4 h-4 md:w-5 md:h-5 rounded-full"
                                alt=""
                            />
                            <span className="text-xs text-slate-300 font-medium truncate">{artwork.owner?.username}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-shrink-0" onClick={handleHeartClick}>
                        <motion.button
                            type="button"
                            className="flex items-center gap-1 text-white focus:outline-none"
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            {liked ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <HeartSolid className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
                                </motion.span>
                            ) : (
                                <HeartOutline className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                            )}
                            <span className="text-xs font-bold">{likeCount}</span>
                        </motion.button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default FeedCard;