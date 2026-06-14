import React, { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import communityService from "../services/communityService";
import PremiumBackground from "../components/PremiumBackground";

const CommunityLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
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
                    <div onClick={() => navigate('/profile')} className="ml-1 w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer">
                        <img 
                            alt="Profile Avatar" 
                            className="w-full h-full object-cover" 
                            src={currentUser?.profilePicture || "https://res.cloudinary.com/demo/image/upload/v1633535288/sample.jpg"}
                        />
                    </div>
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
