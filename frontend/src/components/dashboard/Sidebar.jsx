import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HomeIcon, UserIcon, CloudArrowUpIcon, UserGroupIcon,
    TrophyIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

const NavItem = ({ icon: Icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to}>
            <motion.div
                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-violet-600/20 text-violet-400 border border-violet-600/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                        : "text-slate-400 hover:text-white border border-transparent"
                    }`}
            >
                <Icon className={`w-5 h-5 ${isActive ? "text-violet-400" : "text-slate-500"}`} />
                <span className="font-medium text-sm">{label}</span>
            </motion.div>
        </Link>
    );
};

const Sidebar = ({ user }) => {
    return (
        <aside className="w-64 flex-shrink-0 flex flex-col p-6 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm hidden md:flex h-screen sticky top-0">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight text-white">ArtistConnect</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
                <NavItem to="/feed" icon={HomeIcon} label="Home" />
                <NavItem to="/profile" icon={UserIcon} label="Profile" />
                <NavItem to="/upload" icon={CloudArrowUpIcon} label="Upload" />
                <NavItem to="/communities" icon={UserGroupIcon} label="Communities" />
                <NavItem to="/challenges" icon={TrophyIcon} label="Challenges" />
                <NavItem to="/settings" icon={Cog6ToothIcon} label="Settings" />
            </nav>

            {/* Stats Card */}
            {user && (
                <div className="mt-auto pt-6">
                    <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/5 backdrop-blur-md">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Stats</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Followers</span>
                                <span className="text-white font-bold">{user?.followers?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Artworks</span>
                                <span className="text-white font-bold">{user?.posts?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Likes</span>
                                {/* Assuming you might calculate total likes later */}
                                <span className="text-violet-400 font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;