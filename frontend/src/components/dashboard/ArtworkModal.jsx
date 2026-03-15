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

  if (!artwork) return null;

  const liked = artwork.likedByMe === true;
  const likeCount = Array.isArray(artwork.likes) ? artwork.likes.length : 0;
  const comments = artwork.comments || [];
  const ownerId = artwork.owner?._id || artwork.owner;
  const isOwner = currentUser?._id === ownerId;
  const isFollowingOwner =
    currentUser?.following?.some((id) => id.toString() === (ownerId || '').toString()) ?? false;

  const scrollCommentsToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && comments.length) scrollCommentsToBottom();
  }, [isOpen, comments.length]);

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
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-5xl h-[90vh] md:h-[85vh] transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col md:flex-row">

                <div className="w-full md:w-2/3 h-[40%] md:h-full bg-black flex items-center justify-center relative">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={closeModal}
                    className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 md:hidden z-10"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="w-full md:w-1/3 h-[60%] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-white/5 flex flex-col">

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
                            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-60 ${
                              isFollowingOwner
                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                : 'bg-violet-600 text-white hover:bg-violet-500'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isFollowingOwner ? 'Unfollow' : 'Follow'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-slate-500 hover:text-white hidden md:block"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{artwork.title}</h2>
                      <p className="text-sm text-slate-300 leading-relaxed">{artwork.description || ''}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {artwork.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 border border-white/5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex flex-col min-h-0">
                      <h4 className="text-sm font-bold text-white mb-3">Comments ({comments.length})</h4>
                      <div
                        className="flex-1 min-h-[120px] max-h-[200px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
                        style={{ overflowY: 'auto' }}
                      >
                        {comments.length === 0 ? (
                          <p className="text-center text-slate-500 text-xs py-4">No comments yet. Be the first!</p>
                        ) : (
                          comments.map((c, i) => (
                            <div key={i} className="flex gap-2 text-sm">
                              <img
                                src={c.user?.profilePicture}
                                alt=""
                                className="w-6 h-6 rounded-full flex-shrink-0"
                              />
                              <div>
                                <span className="font-medium text-white">{c.user?.username}</span>
                                <span className="text-slate-400 ml-1">{c.text}</span>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={commentsEndRef} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-slate-900/50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-4">
                        <motion.button
                          onClick={handleLike}
                          disabled={liking}
                          className="flex items-center gap-1.5 text-white hover:text-pink-500 transition-colors focus:outline-none disabled:opacity-60"
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                          {liked ? (
                            <HeartSolid className="w-6 h-6 text-pink-500" />
                          ) : (
                            <HeartIcon className="w-6 h-6" />
                          )}
                          <span className="text-sm font-medium">{likeCount}</span>
                        </motion.button>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <ChatBubbleLeftIcon className="w-6 h-6" />
                          <span className="text-sm">{comments.length}</span>
                        </span>
                        <button className="text-white hover:text-slate-300">
                          <ShareIcon className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleComment} className="relative">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-slate-800 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || commenting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300 px-2 disabled:opacity-50"
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
