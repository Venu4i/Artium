import React from 'react';
import { useTheme } from '../context/ThemeContext';

const PremiumBackground = () => {
    // If ThemeContext isn't available (e.g. in AuthPage before login), default to dark.
    let theme = 'dark';
    try {
        const themeContext = useTheme();
        if (themeContext?.theme) theme = themeContext.theme;
    } catch (e) {
        // Fallback for pages outside provider
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Base Color */}
            <div className={`absolute inset-0 transition-colors duration-700 ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-slate-50'}`}></div>

            {/* Subtle Texture Noise Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            ></div>

            {/* Animated Gradient Orbs */}
            {theme === 'dark' ? (
                <>
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-blob"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
                    <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                </>
            ) : (
                <>
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-300/40 rounded-full blur-[100px] animate-blob"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                    <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                </>
            )}
        </div>
    );
};

export default PremiumBackground;
