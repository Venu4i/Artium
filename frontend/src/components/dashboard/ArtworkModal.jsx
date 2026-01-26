import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const ArtworkModal = ({ isOpen, closeModal, artwork }) => {
    if (!artwork) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl h-[85vh] transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col md:flex-row">

                                {/* LEFT: Full Image */}
                                <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative">
                                    <img
                                        src={artwork.image}
                                        alt={artwork.title}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                    <button onClick={closeModal} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 md:hidden">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* RIGHT: Details Panel */}
                                <div className="w-full md:w-1/3 bg-slate-900 border-l border-white/5 flex flex-col h-full">

                                    {/* Header: User & Close */}
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={artwork.owner?.profilePicture || "https://via.placeholder.com/40"}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full border border-white/10"
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-white">{artwork.owner?.username}</h3>
                                                <button className="text-xs text-violet-400 font-medium hover:text-violet-300">Follow</button>
                                            </div>
                                        </div>
                                        <button onClick={closeModal} className="text-slate-500 hover:text-white hidden md:block">
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Scrollable Content: Title, Desc, Comments */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">{artwork.title}</h2>
                                            <p className="text-sm text-slate-300 leading-relaxed">{artwork.description}</p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {artwork.tags?.map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 border border-white/5">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-4">
                                            <h4 className="text-sm font-bold text-white mb-4">Comments ({artwork.comments?.length || 0})</h4>
                                            {/* Placeholder for comments map */}
                                            <div className="text-center text-slate-500 text-xs py-4">No comments yet. Be the first!</div>
                                        </div>
                                    </div>

                                    {/* Footer: Actions */}
                                    <div className="p-4 border-t border-white/5 bg-slate-900/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex gap-4">
                                                <button className="flex items-center gap-1.5 text-white hover:text-pink-500 transition-colors group">
                                                    <HeartIcon className="w-6 h-6 group-hover:hidden" />
                                                    <HeartSolid className="w-6 h-6 hidden group-hover:block text-pink-500" />
                                                    <span className="text-sm font-medium">{artwork.likes?.length || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 text-white hover:text-cyan-400 transition-colors">
                                                    <ChatBubbleLeftIcon className="w-6 h-6" />
                                                </button>
                                                <button className="text-white hover:text-slate-300">
                                                    <ShareIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Comment Input */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Add a comment..."
                                                className="w-full bg-slate-800 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-violet-500"
                                            />
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300 px-2">Post</button>
                                        </div>
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