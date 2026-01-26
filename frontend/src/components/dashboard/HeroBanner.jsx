import React from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const HeroBanner = ({ username }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl px-6 py-5 mb-8 relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-slate-900 to-slate-900 border border-white/5 flex items-center justify-between"
        >
            <div className="relative z-10">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Hello, {username || "Artist"} <span className="text-2xl">👋</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Ready to inspire the world today?
                </p>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all relative z-10"
            >
                <CloudArrowUpIcon className="w-4 h-4" />
                New Post
            </motion.button>

            {/* Subtle Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
        </motion.div>
    );
};

export default HeroBanner;