import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CameraIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import api from '../api/axios';

const EditProfileModal = ({ isOpen, closeModal, user, setUser }) => {
    const [formData, setFormData] = useState({
        bio: '', instagram: '', twitter: '', portfolioLink: '', skills: ''
    });

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

        if (avatarFile) data.append('avatar', avatarFile);
        if (coverFile) data.append('coverImage', coverFile);

        try {
            const res = await api.patch('/user/edit', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-5 md:p-6 shadow-2xl transition-all">

                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-white">Edit Profile</Dialog.Title>
                                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                        <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* 1. COVER IMAGE */}
                                    <div className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden group bg-slate-800 border border-white/10">
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

                                    {/* 2. AVATAR */}
                                    <div className="flex justify-center -mt-16 relative z-10">
                                        <div className="relative group w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800">
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

                                    {/* 3. INPUTS */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium ml-1">Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                                                rows={3}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium ml-1">Skills (comma separated)</label>
                                            <input
                                                type="text"
                                                value={formData.skills}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                                                placeholder="e.g. React, 3D Art, Photography"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. SOCIALS (Responsive Grid) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium ml-1">Instagram Handle</label>
                                            <input
                                                type="text"
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-violet-500"
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium ml-1">Portfolio URL</label>
                                            <input
                                                type="text"
                                                value={formData.portfolioLink}
                                                onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-violet-500"
                                                placeholder="https://your-site.com"
                                            />
                                        </div>
                                    </div>

                                    {/* SUBMIT BUTTONS */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500 transition-colors disabled:opacity-50 text-sm"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </motion.button>
                                    </div>

                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditProfileModal;