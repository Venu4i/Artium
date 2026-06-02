import React, { useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const ArtworkModal = ({
  isOpen,
  closeModal,
  artwork,
  currentUser,
  onArtworkUpdate,
  onFollowSuccess,
}) => {
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [following, setFollowing] = useState(false);
  const commentsEndRef = useRef(null);

  const scrollCommentsToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ HOOK MOVED HERE: Always call useEffect, regardless of if artwork exists
  useEffect(() => {
    // We use optional chaining (?.) so it doesn't crash if artwork is null
    if (isOpen && artwork?.comments?.length) {
      scrollCommentsToBottom();
    }
  }, [isOpen, artwork?.comments?.length]);

  // ✅ EARLY RETURN MOVED HERE: Now it happens AFTER all hooks are declared
  if (!artwork) return null;

  // Now it's safe to derive these variables because we know artwork is not null
  const liked = artwork.likedByMe === true;
  const likeCount = Array.isArray(artwork.likes) ? artwork.likes.length : 0;
  const comments = artwork.comments || [];
  const ownerId = artwork.owner?._id || artwork.owner;
  const isOwner = currentUser?._id === ownerId;
  const isFollowingOwner =
    currentUser?.following?.some((id) => id.toString() === (ownerId || '').toString()) ?? false;


  const handleLike = async () => {
    if (liking || !onArtworkUpdate) return;
    setLiking(true);
    try {
      const res = await api.post(`/artworks/${artwork._id}/like`);
      const updated = res.data?.data?.artwork;
      if (updated) onArtworkUpdate(updated);
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e?.preventDefault();
    const text = commentText.trim();
    if (!text || commenting || !onArtworkUpdate) return;
    setCommenting(true);
    try {
      const res = await api.post(`/artworks/${artwork._id}/comments`, { text });
      const updated = res.data?.data;
      if (updated) onArtworkUpdate(updated);
      setCommentText('');
      setTimeout(scrollCommentsToBottom, 100);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleFollow = async () => {
    if (following || !ownerId || isOwner || !onFollowSuccess) return;
    setFollowing(true);
    try {
      await api.post(`/user/${ownerId}/follow`);
      onFollowSuccess();
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-500"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-xl"
          leave="ease-in duration-300"
          leaveFrom="opacity-100 backdrop-blur-xl"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-slate-950/80 transition-all" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 md:p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl h-[90vh] md:h-[85vh] transform overflow-hidden rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row relative">
                
                {/* Glowing Orbs behind the modal content */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="w-full md:w-2/3 h-[40%] md:h-full bg-black/40 flex items-center justify-center relative p-2 md:p-6">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                  />
                  <button
                    onClick={closeModal}
                    className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/20 md:hidden z-10 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="w-full md:w-1/3 h-[60%] md:h-full border-t md:border-t-0 md:border-l border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-3xl relative z-10">

                  <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={artwork.owner?.profilePicture || 'https://via.placeholder.com/40'}
                        alt="Avatar"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{artwork.owner?.username}</h3>
                        {!isOwner && (
                          <motion.button
                            onClick={handleFollow}
                            disabled={following}
                            className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full transition-all disabled:opacity-60 border ${
                              isFollowingOwner
                                ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                : 'bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/40 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isFollowingOwner ? 'Following' : 'Follow'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-slate-500 hover:text-white hidden md:block transition-colors p-1 hover:bg-white/5 rounded-full"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 drawer-scroll">
                    <div>
                      <h2 className="text-xl md:text-3xl font-bold text-white mb-2 tracking-tight">{artwork.title}</h2>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">{artwork.description || ''}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {artwork.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full bg-white/5 text-slate-300 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col min-h-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Comments ({comments.length})</h4>
                      <div
                        className="flex-1 overflow-y-auto space-y-4 pr-2 drawer-scroll"
                        style={{ overflowY: 'auto' }}
                      >
                        {comments.length === 0 ? (
                          <p className="text-center text-slate-500 text-xs py-4">No comments yet. Be the first!</p>
                        ) : (
                          comments.map((c, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                              <img
                                src={c.user?.profilePicture}
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10"
                              />
                              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm w-full border border-white/5">
                                <span className="font-bold text-white block mb-0.5">{c.user?.username}</span>
                                <span className="text-slate-300 leading-relaxed">{c.text}</span>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={commentsEndRef} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/10 bg-slate-900/80 flex-shrink-0 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-6">
                        <motion.button
                          onClick={handleLike}
                          disabled={liking}
                          className={`flex items-center gap-2 transition-colors focus:outline-none disabled:opacity-60 ${
                            liked ? 'text-rose-500' : 'text-slate-400 hover:text-white'
                          }`}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          {liked ? (
                            <HeartSolid className="w-6 h-6" />
                          ) : (
                            <HeartIcon className="w-6 h-6" />
                          )}
                          <span className="text-sm font-semibold">{likeCount}</span>
                        </motion.button>
                        <span className="flex items-center gap-2 text-slate-400">
                          <ChatBubbleLeftIcon className="w-6 h-6" />
                          <span className="text-sm font-semibold">{comments.length}</span>
                        </span>
                        <button className="text-slate-400 hover:text-white transition-colors">
                          <ShareIcon className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleComment} className="relative mt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || commenting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white bg-violet-600 px-3 py-1.5 rounded-full hover:bg-violet-500 disabled:opacity-50 transition-colors"
                      >
                        {commenting ? '...' : 'Post'}
                      </button>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ArtworkModal;