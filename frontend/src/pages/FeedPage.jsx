import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import HeroBanner from '../components/dashboard/HeroBanner';
import FeedCard from '../components/dashboard/FeedCard';
import ArtworkModal from '../components/dashboard/ArtworkModal';

const FeedPage = () => {
    const { currentUser } = useOutletContext(); // Get user from Layout
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get('/artworks/feed');
                setArtworks(res.data.data);
            } catch (err) {
                console.error("Feed Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const openModal = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto">

            <HeroBanner username={currentUser?.username} />

            {/* Bigger Grid: columns-xs or columns-sm */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                {loading ? (
                    <div className="text-slate-500 text-center py-20 col-span-full">Loading inspiration...</div>
                ) : (
                    <AnimatePresence>
                        {artworks.map((art, i) => (
                            <FeedCard
                                key={art._id}
                                artwork={art}
                                index={i}
                                onClick={openModal}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* The Detail View Modal */}
            <ArtworkModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                artwork={selectedArtwork}
            />
        </div>
    );
};

export default FeedPage;