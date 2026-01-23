import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const artworks = [
  { id: 1, title: "Neon Dreams", artist: "Aura.Art", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000" },
  { id: 2, title: "Vortex", artist: "Cipher", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000" },
];


export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 p-6">
      {/* Navigation - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
          ArtistConnect
        </h1>
        <div className="flex gap-6">
          <Search className="text-slate-400 hover:text-cyan-400 cursor-pointer transition" />
          <LayoutGrid className="text-violet-500" />
          <button onClick={() => navigate("/profile")}
            className='cursor-pointer'>
          <Users className="text-slate-400" />
          </button>
          
        </div>
      </nav>

      <header className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          Explore the <span className="text-violet-600">Canvas</span>
        </motion.h2>
        <p className="text-slate-400">Handpicked masterpieces from the community.</p>
      </header>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artworks.map((art) => (
          <motion.div
            key={art.id}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
          >
            <img src={art.url} alt={art.title} className="w-full h-80 object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
            <div className="p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 to-transparent">
              <h3 className="text-xl font-semibold">{art.title}</h3>
              <p className="text-slate-400 text-sm">by {art.artist}</p>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="mt-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-full text-sm font-medium transition"
              >
                <Heart size={16} /> Support Artist
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}