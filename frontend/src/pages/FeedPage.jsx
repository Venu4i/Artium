import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import HeroBanner from '../components/dashboard/HeroBanner';
import FeedCard from '../components/dashboard/FeedCard';
import ArtworkModal from '../components/dashboard/ArtworkModal';

const FeedPage = () => {
    const { currentUser, refreshUser } = useOutletContext();
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likingId, setLikingId] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get('/artworks/feed');
                setArtworks(res.data.data || []);
            } catch (err) {
                console.error('Feed Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const openModal = async (artwork) => {
        console.log("Opening modal for:", artwork);
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
        try {
            const res = await api.get(`/artworks/${artwork._id}`);
            const full = res.data?.data;
            if (full) setSelectedArtwork(full);
        } catch (e) {
            console.error('Fetch artwork:', e);
        }
    };

    const updateArtworkInList = (updated) => {
        if (!updated || !updated._id) return;
        setArtworks((prev) =>
            prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a))
        );
        if (selectedArtwork?._id === updated._id) {
            setSelectedArtwork((prev) => (prev ? { ...prev, ...updated } : updated));
        }
    };

    const handleLike = async (artwork) => {
        if (likingId === artwork._id) return;
        setLikingId(artwork._id);
        try {
            const res = await api.post(`/artworks/${artwork._id}/like`);
            const data = res.data?.data;
            if (data?.artwork) updateArtworkInList(data.artwork);
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setLikingId(null);
        }
    };

    const handleModalArtworkUpdate = (updated) => {
        updateArtworkInList(updated);
        setSelectedArtwork((prev) => (prev && updated && prev._id === updated._id ? { ...prev, ...updated } : prev));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroBanner username={currentUser?.username} />

            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-20">
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
                                onLike={handleLike}
                                disabledLike={likingId === art._id}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <ArtworkModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                artwork={selectedArtwork}
                currentUser={currentUser}
                onArtworkUpdate={handleModalArtworkUpdate}
                onFollowSuccess={refreshUser}
            />
        </div>
    );
};

export default FeedPage;