import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import communityService from '../services/communityService';

const EditCommunityModal = ({ isOpen, closeModal, community, setCommunity }) => {
    const [formData, setFormData] = useState({
        name: '', description: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (community) {
            setFormData({
                name: community.name || '',
                description: community.description || ''
            });
            setAvatarPreview(community.avatar);
            setCoverPreview(community.coverImage);
        }
    }, [community]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);

        if (avatarFile) data.append('avatar', avatarFile);
        if (coverFile) data.append('coverImage', coverFile);

        try {
            const res = await communityService.updateCommunity(community._id, data);
            if (res.success) {
                setCommunity(res.community);
                closeModal();
            }
        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || "Failed to update community.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Background Atmospheric Glows */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-community-secondary/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-community-tertiary/10 blur-[120px]"></div>
            </div>

            <div className="bg-[#18181b]/90 backdrop-blur-xl border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[85vh] flex flex-col">
                <div className="p-6 space-y-4 relative overflow-y-auto no-scrollbar">
                    
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-community-secondary">edit</span>
                            Edit Community
                        </h3>
                        <button onClick={closeModal} className="text-community-outline hover:text-white transition-colors material-symbols-outlined">close</button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Community Name</label>
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="Enter community name" 
                                type="text"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Description</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="What is your community about?" 
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Cover Image</label>
                                <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:border-community-secondary/50 transition-colors cursor-pointer bg-black/20 relative overflow-hidden group">
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity rounded-lg" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-2xl text-white drop-shadow-md">upload</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-2xl text-community-outline">photo_library</span>
                                            <span className="text-[10px] text-community-outline text-center">Upload Cover</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Avatar</label>
                                <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl p-2 flex flex-col items-center justify-center gap-1 hover:border-community-secondary/50 transition-colors cursor-pointer bg-black/20 relative overflow-hidden group">
                                    {avatarPreview ? (
                                        <>
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity rounded-lg" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-2xl text-white drop-shadow-md">upload</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-2xl text-community-outline">account_circle</span>
                                            <span className="text-[10px] text-community-outline text-center">Upload Avatar</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[13px] relative z-10">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 space-y-2 relative z-10">
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-2.5 rounded-full font-bold text-white bg-community-secondary hover:bg-community-secondary/90 shadow-lg active:scale-95 transition-all disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                        <button 
                            onClick={closeModal}
                            className="w-full py-2 text-community-outline hover:text-white font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default EditCommunityModal;
