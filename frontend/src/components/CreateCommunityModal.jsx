import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import communityService from '../services/communityService';
import { useNavigate } from 'react-router-dom';

const CreateCommunityModal = ({ isOpen, onClose, onCommunityCreated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            // We call the service and get back the raw community object
            const result = await communityService.createCommunity(formData);
            
            console.log("✅ Success! Result:", result);
    
            // Your backend sends the object directly, so we check for result._id
            if (result && result._id) {
                
                // 1. Tell MyCommunities.jsx to add this to the list
                if (onCommunityCreated) {
                    onCommunityCreated(result);
                }
                
                // 2. Close the modal
                onClose();
                
                // 3. Navigate to the new studio's chat page
                navigate(`/community/${result._id}`);
                
            } else {
                setError("Studio created, but server response was empty.");
            }
        } catch (err) {
            console.error("❌ Modal Error:", err);
            // Error handling for when the backend actually fails
            setError(err.response?.data?.message || 'Failed to create studio. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Dark Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white">Create New Studio</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Studio Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                                    placeholder="e.g. Digital Painters Hub"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none"
                                    placeholder="What is this community about?"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/10 text-violet-600 focus:ring-violet-500 bg-black/50"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-slate-300 cursor-pointer select-none">
                                    Make this studio private (Invite only)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex justify-center items-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create Studio"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateCommunityModal;