import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import PremiumBackground from '../components/PremiumBackground';

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
        <div className={`min-h-screen font-body selection:bg-[#d2bbff]/30 selection:text-[#d2bbff] transition-colors duration-500 text-[#e8dfee]`}>
            
            <PremiumBackground />

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