import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import api from '../api/axios';

const EditProfileModal = ({ isOpen, closeModal, user, refreshUser, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        username: '', bio: '', instagram: '', twitter: '', portfolioLink: '', skills: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [skillsList, setSkillsList] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
                instagram: user.socialLinks?.instagram || '',
                twitter: user.socialLinks?.twitter || '',
                portfolioLink: user.socialLinks?.portfolio || ''
            });
            setSkillsList(user.skills || []);
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

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skillsList.includes(skillInput.trim())) {
                setSkillsList([...skillsList, skillInput.trim()]);
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkillsList(skillsList.filter(s => s !== skillToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        // data.append('username', formData.username); // Assuming backend might not allow username changes, but if it does, it's here
        data.append('bio', formData.bio);
        data.append('instagram', formData.instagram);
        data.append('twitter', formData.twitter);
        data.append('portfolioLink', formData.portfolioLink);
        data.append('skills', skillsList.join(', '));

        if (avatarFile) data.append('avatar', avatarFile);
        if (coverFile) data.append('coverImage', coverFile);

        try {
            const res = await api.patch('/user/edit', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (onUpdateSuccess) {
                onUpdateSuccess(res.data.data);
            }
            if (refreshUser) refreshUser();
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto font-body-regular text-on-surface dark:text-surface-bright">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="bg-surface bright:bg-surface-bright dark:bg-inverse-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                
                                {/* Header */}
                                <div className="flex justify-between items-center px-6 py-4 border-b border-surface-variant dark:border-outline-variant/20">
                                    <Dialog.Title as="h2" className="text-lg font-bold text-on-surface dark:text-surface-bright">
                                        Edit Profile
                                    </Dialog.Title>
                                    <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface dark:text-outline dark:hover:text-surface-bright transition-colors rounded-full p-1">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                {/* Body (Scrollable) */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                    
                                    {/* Visuals Preview */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-on-surface-variant dark:text-outline">Profile Visuals</h3>
                                        
                                        <div className="relative h-32 rounded-xl overflow-hidden bg-surface-container-high group">
                                            <img 
                                                alt="Cover preview" 
                                                className="w-full h-full object-cover opacity-70 transition-opacity" 
                                                src={coverPreview || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <label className="px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/20 text-xs font-medium cursor-pointer hover:bg-black/60 transition-colors">
                                                    Change Cover
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 -mt-10 pl-4 relative z-10">
                                            <div className="w-20 h-20 rounded-xl border-4 border-surface dark:border-inverse-surface overflow-hidden relative group bg-surface-container-high">
                                                <img 
                                                    alt="Avatar preview" 
                                                    className="w-full h-full object-cover" 
                                                    src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
                                                />
                                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Username (Display Name)</label>
                                            <input 
                                                className="w-full px-4 py-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-sm text-on-surface dark:text-surface-bright disabled:opacity-50" 
                                                type="text" 
                                                value={formData.username}
                                                disabled
                                                placeholder="Username cannot be changed here"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Bio</label>
                                                <span className="text-xs text-on-surface-variant dark:text-outline">{formData.bio.length}/200</span>
                                            </div>
                                            <textarea 
                                                className="w-full px-4 py-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-sm text-on-surface dark:text-surface-bright resize-none" 
                                                rows="3"
                                                maxLength={200}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                placeholder="Tell us about your art..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Skills & Expertise</label>
                                            <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl min-h-[50px]">
                                                {skillsList.map((skill, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-surface dark:bg-inverse-surface rounded-full text-xs font-medium border border-outline-variant/30">
                                                        {skill} 
                                                        <span 
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
                                                        >
                                                            close
                                                        </span>
                                                    </div>
                                                ))}
                                                <input 
                                                    className="bg-transparent border-none outline-none text-xs flex-1 py-1 min-w-[100px] text-on-surface dark:text-surface-bright placeholder-on-surface-variant dark:placeholder-outline" 
                                                    placeholder="Add skill & press Enter..." 
                                                    type="text"
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyDown={handleAddSkill}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Portfolio Website URL</label>
                                            <input 
                                                className="w-full px-4 py-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-sm text-on-surface dark:text-surface-bright" 
                                                type="url" 
                                                value={formData.portfolioLink}
                                                onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                                                placeholder="https://yourportfolio.com"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Instagram</label>
                                                <input 
                                                    className="w-full px-4 py-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-sm text-on-surface dark:text-surface-bright" 
                                                    type="text" 
                                                    value={formData.instagram}
                                                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                                                    placeholder="@username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-on-surface-variant dark:text-outline uppercase tracking-wider">Twitter</label>
                                                <input 
                                                    className="w-full px-4 py-3 bg-surface-container-low dark:bg-on-background border border-surface-variant dark:border-outline-variant/30 rounded-xl focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-sm text-on-surface dark:text-surface-bright" 
                                                    type="text" 
                                                    value={formData.twitter}
                                                    onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                                                    placeholder="@username"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-surface-variant dark:border-outline-variant/20 flex justify-end gap-3 bg-surface-container-lowest dark:bg-inverse-surface mt-auto">
                                    <button 
                                        onClick={closeModal}
                                        className="px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant dark:text-outline hover:bg-surface-container-high dark:hover:bg-on-background transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                                
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditProfileModal;