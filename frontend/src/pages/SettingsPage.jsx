import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen text-zinc-800 dark:text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 bg-zinc-100 dark:bg-white/5 backdrop-blur-md border border-zinc-300 dark:border-white/10 rounded-full text-zinc-900 dark:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Preferences</h1>
                </div>

                <div className="bg-zinc-100/50 dark:bg-slate-900/40 backdrop-blur-3xl border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Appearance</h2>
                    
                    <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/5">
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">Theme Preference</h3>
                            <p className="text-sm text-zinc-500 dark:text-slate-400">Toggle between the dynamic light and dark mesh themes.</p>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-zinc-900 dark:text-white font-bold rounded-full transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                        </button>
                    </div>

                    <div className="mt-10 pt-10 border-t border-zinc-200 dark:border-white/5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Account Details</h2>
                        <p className="text-zinc-500 dark:text-slate-400">Additional settings can be configured here in the future.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
