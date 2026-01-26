import React from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const HeroBanner = ({ username }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 mb-10 relative overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 border border-white/10 shadow-2xl"
        >
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    Welcome Back, {username || "Creator"}
                </h1>
                <p className="text-slate-300 mb-6 text-lg">
                    Discover, create, and share your artistic vision with our vibrant community.
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/upload')}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
                >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Start Creating
                </motion.button>
            </div>
        </motion.div>
    );
};

export default HeroBanner;