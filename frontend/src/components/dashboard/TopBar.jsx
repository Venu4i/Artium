import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

const TopBar = ({ user, searchQuery, setSearchQuery }) => {
    return (
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-md z-20 sticky top-0">

            {/* Search - Compact */}
            <div className="relative w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-1 hover:bg-white/5 rounded-full transition-colors">
                    <BellIcon className="w-5 h-5 text-slate-400" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                </button>

                {/* Connected Profile Section */}
                <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 hover:opacity-80 transition-opacity">
                    <div className="text-right hidden lg:block leading-tight">
                        <p className="text-xs font-bold text-white">{user?.username || "Loading..."}</p>
                        <p className="text-[10px] text-slate-400">Artist</p>
                    </div>
                    <img
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                        alt="User"
                        className="w-8 h-8 rounded-full border border-white/10 object-cover"
                    />
                </Link>
            </div>
        </header>
    );
};

export default TopBar;