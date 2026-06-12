import React, { useState } from "react";
import challengeService from "../services/challengeService";
import { useParams } from "react-router-dom";

const CreateChallengeModal = ({ isOpen, onClose, onSuccess }) => {
    const { id: communityId } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [maxPoints, setMaxPoints] = useState(100);
    const [mediaType, setMediaType] = useState("Image");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!title || !description || !deadline) {
            setError("Title, description, and deadline are required");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await challengeService.createChallenge(communityId, {
                title,
                description,
                deadline,
                maxPoints: Number(maxPoints),
                mediaTypeAccepted: mediaType.toLowerCase()
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create challenge");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-community-background/90 backdrop-blur-xl border border-community-outline/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6 relative">
                    {/* Background Atmospheric Glows */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-community-secondary/5 blur-[80px] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-community-secondary">auto_awesome</span>
                            New Challenge
                        </h3>
                        <button onClick={onClose} className="text-community-outline hover:text-white transition-colors material-symbols-outlined">close</button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-community-outline uppercase tracking-widest">Challenge Title</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/40 border-none rounded-xl py-3 px-4 text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="Enter a visionary name..." 
                                type="text"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-community-outline uppercase tracking-widest">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/40 border-none rounded-xl py-3 px-4 text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="Describe the creative mission..." 
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-community-outline uppercase tracking-widest">Submission Deadline</label>
                                <input 
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-black/40 border-none rounded-xl py-3 px-4 text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                    type="date"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-community-outline uppercase tracking-widest">Max Points</label>
                                <input 
                                    value={maxPoints}
                                    onChange={(e) => setMaxPoints(e.target.value)}
                                    className="w-full bg-black/40 border border-transparent focus:border-community-tertiary rounded-xl py-3 px-4 text-community-on-surface focus:ring-0 transition-all" 
                                    max="100" 
                                    type="number"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-community-outline uppercase tracking-widest">Media Type Accepted</label>
                            <div className="flex flex-wrap gap-2">
                                {['Image', 'Audio', 'Video', 'Text'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setMediaType(type)}
                                        className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                                            mediaType === type 
                                                ? 'bg-gradient-to-r from-community-secondary to-pink-500 text-white border-transparent' 
                                                : 'border-community-outline/20 text-community-outline hover:border-community-outline/50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[13px] relative z-10">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 space-y-3 relative z-10">
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-r from-community-secondary to-pink-500 shadow-[0_0_15px_rgba(255,176,205,0.3)] hover:shadow-[0_0_25px_rgba(255,176,205,0.5)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Challenge'}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-2 text-community-outline hover:text-white font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateChallengeModal;
