import React, { Fragment, useMemo } from 'react'; // Added useMemo for performance
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import {
    HomeIcon, CloudArrowUpIcon, UserGroupIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon, ArrowRightOnRectangleIcon, TrophyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

// 1. IMPROVED NAV ITEM
const NavItem = ({ icon: Icon, label, to, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} onClick={onClick} className="block mb-1">
            <motion.div
                whileTap={{ scale: 0.95 }}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium translate-x-1"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                }`}
            >
                <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                        isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    }`} 
                />
                <span className={`${isActive ? 'font-medium' : ''} text-sm`}>{label}</span>
            </motion.div>
        </Link>
    );
};

// 2. ACTION ITEM (For Buttons like Logout)
const ActionItem = ({ icon: Icon, label, onClick }) => {
    return (
        <button onClick={onClick} className="block w-full text-left">
            <motion.div
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out border text-slate-400 border-transparent hover:bg-rose-500/10 hover:text-rose-400"
            >
                <Icon className="w-5 h-5 transition-colors duration-300 text-slate-500 group-hover:text-rose-400" />
                <span className="font-medium text-sm">{label}</span>
            </motion.div>
        </button>
    );
};

// Reusable Content
const NavContent = ({ user, closeMobileMenu }) => {
    const { logout } = useAuth();

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="mb-6 px-4 pt-2 flex items-center justify-between">
                <div>
                    <h2 className="font-display text-xl font-black text-slate-900 dark:text-white">Creative Prism</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Artist Workspace</p>
                </div>
                
                {closeMobileMenu && (
                    <button onClick={closeMobileMenu} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-grow overflow-y-auto drawer-scroll pr-2 pb-20">
                <NavItem to="/feed" icon={HomeIcon} label="Discover" onClick={closeMobileMenu} />
                <NavItem to="/chat" icon={ChatBubbleLeftRightIcon} label="Messages" onClick={closeMobileMenu} />
                
                <div className="pt-4 pb-1">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Communities</p>
                </div>
                <NavItem to="/communities" icon={UserGroupIcon} label="Hubs" onClick={closeMobileMenu} />
                <NavItem to="/my-communities" icon={UserGroupIcon} label="Guilds" onClick={closeMobileMenu} />
                <NavItem to="/hall-of-fame" icon={TrophyIcon} label="Hall of Fame" onClick={closeMobileMenu} />
            </nav>

            {/* Upload Button at Bottom */}
            <div className="mt-auto">
                <Link to="/upload" onClick={closeMobileMenu}>
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Upload
                    </motion.button>
                </Link>
            </div>
        </div>
    );
};

const Sidebar = ({ user, mobileOpen, setMobileOpen }) => {
    return (
        <>
            <aside className="hidden md:flex fixed left-4 top-24 bottom-4 w-64 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl flex-col gap-2 p-4 transition-colors duration-300 z-40">
                <NavContent user={user} />
            </aside>

            <Transition show={mobileOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={setMobileOpen}>
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

export default Sidebar