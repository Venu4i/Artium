import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../api/axios';

const MainLayout = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile State

    // Fetch user once for the whole layout
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user/profile');
                setCurrentUser(res.data.data);
            } catch (err) {
                console.error("Layout User Fetch Error:", err);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-violet-500/30">

            {/* Sidebar (Handles both Desktop & Mobile) */}
            <Sidebar
                user={currentUser}
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* TopBar with Mobile Toggle */}
                <TopBar
                    user={currentUser}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onMenuClick={() => setMobileMenuOpen(true)}
                />

                {/* Dynamic Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <Outlet context={{ currentUser }} />
                </div>

            </main>
        </div>
    );
};

export default MainLayout;