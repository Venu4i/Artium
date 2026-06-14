import React, { useEffect, useState, Fragment } from "react";
import { Outlet, NavLink, Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, Transition } from '@headlessui/react';
import { UserIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from "../context/ThemeContext";
import communityService from "../services/communityService";
import PremiumBackground from "../components/PremiumBackground";

const CommunityLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const currentUser = useSelector((state) => state.auth.user);
    const [community, setCommunity] = useState(null);

    useEffect(() => {
        const fetchCommunityData = async () => {
            try {
                const res = await communityService.getCommunity(id);
                const rawData = res?.data || res;
                let normalizedData;
                if (Array.isArray(rawData)) {
                    normalizedData = rawData.find(c => String(c._id) === String(id));
                } else {
                    normalizedData = rawData;
                }
                setCommunity(normalizedData);
            } catch (error) {
                console.error("❌ Fetch Error:", error);
                navigate("/communities");
            }
        };
        fetchCommunityData();
    }, [id, navigate]);

    const goBack = () => {
        navigate("/my-communities");
    };

    if (!community) {
        return <div className="min-h-screen bg-community-background flex items-center justify-center text-community-on-surface">Loading Community...</div>;
    }

    const isAdmin = String(community.admin?._id || community.admin) === String(currentUser?._id);
    const pointsToShow = isAdmin ? (currentUser?.points?.global || 0) : (currentUser?.points?.communities?.[id] || 0);
    const pointsTitle = isAdmin ? "Global Points" : "Community Points";

    return (
        <div className={`font-body h-screen flex flex-col overflow-hidden selection:bg-[#d2bbff]/30 selection:text-[#d2bbff] transition-colors duration-500`}>
            
            <PremiumBackground />
            
            {/* TopNavBar */}
            <nav className="bg-community-surface/80 dark:bg-community-surface-dim/80 backdrop-blur-xl text-community-primary dark:text-community-primary font-headline text-headline-md fixed top-0 w-full z-50 border-b border-community-outline/10 dark:border-white/10 shadow-[0_0_15px_rgba(200,198,200,0.1)] flex justify-between items-center px-4 md:px-10 h-20">
                <div className="flex items-center gap-6">
                    <span className="font-display text-[32px] tracking-tight text-community-on-surface dark:text-community-on-surface-variant font-bold">
                        Artium
                    </span>
                </div>
                <div className="hidden md:flex gap-10 items-center">
                    <NavLink 
                        to={`/community/${id}/workspace`} 
                        className={({isActive}) => isActive ? "text-[20px] text-community-tertiary border-b-2 border-community-tertiary pb-1 font-bold transition-colors" : "text-[18px] text-community-on-surface-variant hover:text-community-on-surface transition-colors"}
                    >
                        Workspace
                    </NavLink>
                    <NavLink 
                        to={`/community/${id}/arena`} 
                        className={({isActive}) => isActive ? "text-[20px] text-community-tertiary border-b-2 border-community-tertiary pb-1 font-bold transition-colors" : "text-[18px] text-community-on-surface-variant hover:text-community-on-surface transition-colors"}
                    >
                        Arena
                    </NavLink>
                    <NavLink 
                        to={`/community/${id}/pantheon`} 
                        className={({isActive}) => isActive ? "text-[20px] text-community-tertiary border-b-2 border-community-tertiary pb-1 font-bold transition-colors" : "text-[18px] text-community-on-surface-variant hover:text-community-on-surface transition-colors"}
                    >
                        Pantheon
                    </NavLink>
                </div>
                <div className="flex items-center gap-3">
                    {/* Points Pill */}
                    {currentUser && (
                        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-full px-3 py-1.5 border border-black/10 dark:border-white/10 shadow-inner mr-2" title={pointsTitle}>
                            <div className="bg-cyan-400 text-slate-900 rounded-full p-0.5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                            <span className="text-sm font-bold text-community-on-surface font-mono tracking-wide">
                                {pointsToShow.toLocaleString()}
                            </span>
                        </div>
                    )}

                    <button onClick={goBack} title="Leave Community" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-community-error">logout</span>
                    </button>
                    <button onClick={toggleTheme} aria-label="Toggle Theme" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-community-on-surface">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <Link to="/notifications" aria-label="Notifications" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-community-on-surface">notifications</span>
                    </Link>
                    <Menu as="div" className="relative ml-1 z-50">
                        <Menu.Button className="flex items-center focus:outline-none w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer">
                            <img 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover" 
                                src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}`}
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
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 mt-20 flex overflow-hidden relative">
                <Outlet context={{ community, currentUser }} />
            </main>
        </div>
    );
};

export default CommunityLayout;
