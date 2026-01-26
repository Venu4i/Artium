import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

const TopBar = ({ user, searchQuery, setSearchQuery }) => {
    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-slate-900/80 backdrop-blur-md z-20 sticky top-0">
            {/* Search */}
            <div className="relative w-96">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search artworks, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative group">
                    <BellIcon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-white">{user?.username || "Creator"}</p>
                        <p className="text-xs text-slate-400">Pro Account</p>
                    </div>
                    <Link to="/profile">
                        <img
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                            alt="User"
                            className="w-10 h-10 rounded-full border-2 border-violet-500/50 object-cover"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default TopBar;