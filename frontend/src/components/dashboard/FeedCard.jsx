
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HeartIcon, 
    ChatBubbleLeftIcon, 
    ShareIcon, 
    LinkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import api from '../../api/axios';

const FeedCard = ({ artwork, index, onClick, onLike, disabledLike, onCommentClick, onFollow, currentUser }) => {
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const liked = artwork.likedByMe === true;
    const likeCount = Array.isArray(artwork.likes) ? artwork.likes.length : 0;
    const commentsCount = Array.isArray(artwork.comments) ? artwork.comments.length : 0;
    
    const isOwner = currentUser?._id === (artwork.owner?._id || artwork.owner);
    const isFollowing = currentUser?.following?.some(id => id.toString() === (artwork.owner?._id || '').toString());

    const handleHeartClick = (e) => {
        e.stopPropagation();
        if (onLike && !disabledLike) onLike(artwork);
    };

    const handleComment = (e) => {
        e.stopPropagation();
        if (onCommentClick) onCommentClick(artwork);
    };

    const handleFollowClick = (e) => {
        e.stopPropagation();
        if (onFollow && !isOwner) onFollow(artwork.owner?._id, isFollowing);
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        setSharing(!sharing);
    };

    const handleNativeShare = async (e) => {
        e.stopPropagation();
        setSharing(false);
        const url = `${window.location.origin}/feed?artwork=${artwork._id}`;
        
        try {
            await api.post(`/artworks/${artwork._id}/share`);
        } catch (err) {
            console.error('Share tracking error', err);
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: artwork.title,
                    text: `Check out ${artwork.title} on Artium!`,
                    url: url,
                });
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            handleCopyLink(e, url);
        }
    };

    const handleCopyLink = async (e, customUrl) => {
        e.stopPropagation();
        const url = customUrl || `${window.location.origin}/feed?artwork=${artwork._id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setSharing(false);
            
            // Track share
            await api.post(`/artworks/${artwork._id}/share`);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <article 
            className="masonry-item break-inside-avoid mb-4 md:mb-6 group relative bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-visible transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => onClick(artwork)}
        >
            <div className="relative overflow-hidden rounded-t-2xl">
                <img 
                    src={artwork.image} 
                    alt={artwork.title} 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                
                {artwork.tags && artwork.tags.length > 0 && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-white text-xs font-semibold rounded-full shadow-sm">
                            {artwork.tags[0]}
                        </span>
                    </div>
                )}

                {/* Engagement Glass Pill (Hover) - Moved inside the image container to sit correctly at the bottom of the image */}
                <div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-full shadow-lg"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with pill
                >
                    <button onClick={handleHeartClick} disabled={disabledLike} className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${liked ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {liked ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                        <span className="text-xs font-medium">{likeCount}</span>
                    </button>
                    
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    
                    <button onClick={handleComment} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span className="text-xs font-medium">{commentsCount}</span>
                    </button>
                    
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    
                    <div className="relative">
                        <button onClick={handleShare} className="flex items-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        
                        {/* Share Dropdown */}
                        <AnimatePresence>
                            {sharing && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full mb-3 -right-10 w-40 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden text-sm z-20"
                                >
                                    <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                        {copied ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                                        {copied ? <span className="text-emerald-500">Copied!</span> : <span>Copy Link</span>}
                                    </button>
                                    <button onClick={handleNativeShare} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-white/5">
                                        <ShareIcon className="w-4 h-4" />
                                        Share via...
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-display text-xl font-bold mb-1 text-slate-900 dark:text-white">{artwork.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {artwork.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <img 
                            src={artwork.owner?.profilePicture || 'https://via.placeholder.com/40'} 
                            alt={artwork.owner?.username} 
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover"
                        />
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{artwork.owner?.username}</span>
                    </div>
                    
                    {!isOwner && (
                        <button 
                            onClick={handleFollowClick}
                            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                                isFollowing 
                                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border-transparent' 
                                    : 'border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

export default FeedCard;