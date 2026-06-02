import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const MainLayout = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile State
    const { theme } = useTheme();
    const location = useLocation();

    // Pages without navigation
    const hideNavigation = location.pathname.startsWith('/profile') || location.pathname.startsWith('/settings');

    const fetchUser = React.useCallback(async () => {
        try {
            const res = await api.get('/user/profile');
            setCurrentUser(res.data.data);
        } catch (err) {
            console.error("Layout User Fetch Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <div className={`min-h-screen font-body selection:bg-[#d2bbff]/30 selection:text-[#d2bbff] transition-colors duration-500 ${
            theme === 'dark' ? 'bg-[#09090b] text-[#e8dfee]' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* Ambient Glow Effects from Auth Page (Dark Mode Only) */}
            {theme === 'dark' && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#d2bbff]/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-[#4cd7f6]/10 rounded-full blur-[80px]"></div>
                </div>
            )}

            {!hideNavigation && (
                <TopBar
                    user={currentUser}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onMenuClick={() => setMobileMenuOpen(true)}
                />
            )}

            {!hideNavigation && (
                <Sidebar
                    user={currentUser}
                    mobileOpen={mobileMenuOpen}
                    setMobileOpen={setMobileMenuOpen}
                />
            )}

            {/* Main Content Canvas */}
            <main className={`relative z-10 ${!hideNavigation ? 'pt-28 pb-12 px-4 md:ml-72 md:pr-8 max-w-7xl mx-auto' : 'h-screen overflow-y-auto'}`}>
                <Outlet context={{ currentUser, refreshUser: fetchUser }} />
            </main>
        </div>
    );
};

export default MainLayout;