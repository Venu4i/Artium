import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CameraIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'; // Import PhotoIcon
import { motion } from 'framer-motion';
import api from '../api/axios';

const EditProfileModal = ({ isOpen, closeModal, user, setUser }) => {
    const [formData, setFormData] = useState({
        bio: '', instagram: '', twitter: '', portfolioLink: '', skills: ''
    });

    // Previews & Files
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                bio: user.bio || '',
                instagram: user.socialLinks?.instagram || '',
                twitter: user.socialLinks?.twitter || '',
                portfolioLink: user.socialLinks?.portfolio || '',
                skills: user.skills ? user.skills.join(', ') : ''
            });
            setAvatarPreview(user.profilePicture);
            setCoverPreview(user.coverImage);
        }
    }, [user]);

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
    
        const data = new FormData();
        data.append('bio', formData.bio);
        data.append('instagram', formData.instagram);
        data.append('twitter', formData.twitter);
        data.append('portfolioLink', formData.portfolioLink);
        data.append('skills', formData.skills);
    
        // Append Images if selected
        if (avatarFile) data.append('avatar', avatarFile);
        if (coverFile) data.append('coverImage', coverFile);
    
        try {
            // Using your axios instance
            const res = await api.patch('/user/edit', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser(res.data.data);
            closeModal();
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-xl">

                            <div className="flex justify-between items-center mb-6">
                                <Dialog.Title as="h3" className="text-xl font-bold text-white">Edit Profile</Dialog.Title>
                                <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* 1. COVER IMAGE UPLOAD */}
                                <div className="relative w-full h-32 rounded-xl overflow-hidden group bg-slate-800 border border-white/10">
                                    <img
                                        src={coverPreview || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                                    />
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PhotoIcon className="w-8 h-8 text-white mb-1" />
                                        <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">Change Cover</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                    </label>
                                </div>

                                {/* 2. AVATAR UPLOAD */}
                                <div className="flex justify-center -mt-16 relative z-10">
                                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800">
                                        <img
                                            src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.username}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <CameraIcon className="w-8 h-8 text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        </label>
                                    </div>
                                </div>

                                {/* 3. BIO & SKILLS */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white outline-none focus:border-violet-500"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.skills}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white outline-none focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* 4. SOCIAL LINKS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400">Instagram Handle</label>
                                        <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white outline-none focus:border-violet-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400">Portfolio URL</label>
                                        <input type="text" value={formData.portfolioLink} onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white outline-none focus:border-violet-500" />
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-500">
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditProfileModal;