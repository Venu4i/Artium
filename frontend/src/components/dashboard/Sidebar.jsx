import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import {
    HomeIcon, UserIcon, CloudArrowUpIcon, UserGroupIcon,
    TrophyIcon, Cog6ToothIcon, XMarkIcon
} from '@heroicons/react/24/outline';

// 1. IMPROVED NAV ITEM (Smooth CSS Transitions, No Lag)
const NavItem = ({ icon: Icon, label, to, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} onClick={onClick} className="block">
            <motion.div
                whileTap={{ scale: 0.95 }}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out border ${
                    isActive
                        ? "bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)]"
                        : "text-slate-400 border-transparent hover:bg-white/5 hover:text-white"
                }`}
            >
                {/* Active Indicator Line (Optional Modern Touch) */}
                {isActive && (
                    <div className="absolute left-0 h-6 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                )}

                <Icon 
                    className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-200"
                    }`} 
                />
                <span className="font-medium text-sm">{label}</span>
            </motion.div>
        </Link>
    );
};

// Reusable Content (Brand + Links + Stats)
const NavContent = ({ user, closeMobileMenu }) => (
    <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center justify-between px-2 mb-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-900/20">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight text-white">ArtistConnect</span>
            </div>

            {/* Mobile Close Button */}
            {closeMobileMenu && (
                <button onClick={closeMobileMenu} className="p-1 text-slate-400 hover:text-white md:hidden transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
            <NavItem to="/feed" icon={HomeIcon} label="Home" onClick={closeMobileMenu} />
            <NavItem to="/profile" icon={UserIcon} label="Profile" onClick={closeMobileMenu} />
            <NavItem to="/upload" icon={CloudArrowUpIcon} label="Upload" onClick={closeMobileMenu} />
            <NavItem to="/communities" icon={UserGroupIcon} label="Communities" onClick={closeMobileMenu} />
            <NavItem to="/challenges" icon={TrophyIcon} label="Challenges" onClick={closeMobileMenu} />
            <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" onClick={closeMobileMenu} />
        </nav>

        {/* Stats Card */}
        {user && (
            <div className="mt-auto pt-6">
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/5 backdrop-blur-md">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Stats</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Followers</span>
                            <span className="text-white font-bold">{user?.followers?.length ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Following</span>
                            <span className="text-white font-bold">{user?.following?.length ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Artworks</span>
                            <span className="text-white font-bold">{user?.posts?.length ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Likes</span>
                            <span className="text-violet-400 font-bold">{user?.likedPosts?.length ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const Sidebar = ({ user, mobileOpen, setMobileOpen }) => {
    return (
        <>
            {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
            <aside className="w-64 flex-shrink-0 flex-col p-6 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm hidden md:flex h-screen sticky top-0">
                <NavContent user={user} />
            </aside>

            {/* 2. MOBILE SIDEBAR (Dialog) */}
            <Transition show={mobileOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={setMobileOpen}>
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 p-6 pt-5 pb-4 text-slate-100 shadow-xl">
                                <NavContent user={user} closeMobileMenu={() => setMobileOpen(false)} />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Sidebar;