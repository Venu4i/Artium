import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
    BellIcon, Bars3Icon, SunIcon, MoonIcon,
    UserIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../services/notificationService';
import { useState, useEffect } from 'react';

const TopBar = ({ user, onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();
    
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        
        // Fetch initial unread count
        const fetchUnread = async () => {
            try {
                const res = await notificationService.getNotifications();
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchUnread();
    }, [user]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleNewNotification = (notif) => {
            setUnreadCount(prev => prev + 1);
        };

        socket.on("new-notification", handleNewNotification);

        return () => {
            socket.off("new-notification", handleNewNotification);
        };
    }, [socket, user]);

    return (
        <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center h-20 transition-colors duration-300">

            {/* Left: Mobile Menu & Logo */}
            <div className="flex items-center gap-4">
                {/* Mobile Hamburger Button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <h1 className="font-display text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Artium</h1>
                <div className="hidden md:block">
                    {/* Placeholder for left-side if needed later */}
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                {/* Points Pill */}
                {user && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/50 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700/50 shadow-inner" title="Global Points">
                        <div className="bg-cyan-400 text-slate-900 rounded-full p-0.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <span className="text-sm font-bold text-cyan-400 font-mono tracking-wide">
                            {(user?.points?.global || 0).toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Theme Switcher */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-900 dark:text-white"
                >
                    {theme === 'dark' ? (
                        <SunIcon className="w-5 h-5" />
                    ) : (
                        <MoonIcon className="w-5 h-5" />
                    )}
                </button>

                {/* Notifications */}
                <Link to="/notifications" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-900 dark:text-white">
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-900"></span>
                    )}
                </Link>

                {/* Connected Profile Section Dropdown */}
                <Menu as="div" className="relative ml-2">
                    <Menu.Button className="flex items-center focus:outline-none">
                        <img
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 cursor-pointer"
                        />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl bg-white dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl focus:outline-none overflow-hidden">
                            <div className="p-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className={`${
                                                active ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                            } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                        >
                                            <UserIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-400" aria-hidden="true" />
                                            Profile
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/settings')}
                                            className={`${
                                                active ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                            } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                        >
                                            <Cog8ToothIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" aria-hidden="true" />
                                            Settings
                                        </button>
                                    )}
                                </Menu.Item>
                                <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${
                                                active ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                                            } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400" aria-hidden="true" />
                                            Logout
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
};

export default TopBar;