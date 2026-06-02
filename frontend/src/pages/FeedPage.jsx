import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import FeedCard from '../components/dashboard/FeedCard';
import ArtworkModal from '../components/dashboard/ArtworkModal';
import Masonry from 'react-masonry-css';

const FeedPage = () => {
    const { currentUser, refreshUser } = useOutletContext();
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States for Modals
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

    const fetchFullArtwork = async (artwork, callback) => {
        try {
            const res = await api.get(`/artworks/${artwork._id}`);
            const full = res.data?.data;
            if (full) callback(full);
        } catch (e) {
            console.error('Fetch artwork:', e);
        }
    };

    const openModal = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
        fetchFullArtwork(artwork, setSelectedArtwork);
    };

    const updateArtworkInList = (updated) => {
        if (!updated || !updated._id) return;
        setArtworks((prev) =>
            prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a))
        );
        
        // Sync active states
        if (selectedArtwork?._id === updated._id) setSelectedArtwork(prev => ({ ...prev, ...updated }));
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

    const handleFollow = async (userId, isFollowing) => {
        if (!userId || isFollowing) return; // For now, the card only handles following, not unfollowing to prevent accidental clicks
        try {
            await api.post(`/user/${userId}/follow`);
            refreshUser();
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    const breakpointColumnsObj = {
        default: 4,
        1280: 3,
        1024: 3,
        768: 2,
        640: 1
    };

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-500">
            <div className="max-w-7xl mx-auto pt-8 pb-20">
                
                {/* Header Section */}
                <header className="mb-10 ">
                    <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-black dark:text-white ">
                        Welcome back, {currentUser?.username || 'Creator'}.
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-light tracking-wide">
                        Discover today's infinite canvas.
                    </p>
                </header>

                {loading ? (
                    <div className="text-slate-500 text-center py-20">Loading inspiration...</div>
                ) : (
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="flex w-auto -ml-4 md:-ml-6"
                        columnClassName="pl-4 md:pl-6 bg-clip-padding"
                    >
                        {artworks.map((art, i) => (
                            <FeedCard
                                key={art._id}
                                artwork={art}
                                index={i}
                                currentUser={currentUser}
                                onClick={openModal}
                                onLike={handleLike}
                                disabledLike={likingId === art._id}
                                onCommentClick={openModal} // Comment opens modal directly
                                onFollow={handleFollow}
                            />
                        ))}
                    </Masonry>
                )}

                <ArtworkModal
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    artwork={selectedArtwork}
                    currentUser={currentUser}
                    onArtworkUpdate={updateArtworkInList}
                    onFollowSuccess={refreshUser}
                />
            </div>
        </div>
    );
};

export default FeedPage;