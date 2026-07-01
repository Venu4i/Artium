import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const [artType, setArtType] = useState("");
    const [aiDescription, setAiDescription] = useState("");
    const [generatedChallenges, setGeneratedChallenges] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleGenerateAI = async () => {
        if (!artType || !aiDescription) {
            setError("Please enter art type and description.");
            return;
        }

        try {
            setIsGenerating(true);
            setError(null);

            const res = await challengeService.generateArtChallenge({
                artType,
                description: aiDescription,
            });

            setGeneratedChallenges(res.data);
        } catch (err) {
            setError("Failed to generate challenge");
        } finally {
            setIsGenerating(false);
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
                            <span className="material-symbols-outlined text-community-secondary">auto_awesome</span>
                            New Challenge
                        </h3>
                        <button onClick={onClose} className="text-community-outline hover:text-white transition-colors material-symbols-outlined">close</button>
                    </div>

            <div className="space-y-3 border border-white/10 rounded-xl p-4 bg-black/20">

                <h4 className="text-sm font-semibold text-white">
                    ✨ Generate Challenge with AI
                </h4>

                <input
                    value={artType}
                    onChange={(e) => setArtType(e.target.value)}
                    placeholder="Art Type (Digital Painting, Photography...)"
                    className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all"
                />

                <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="Theme or idea..."
                    rows={2}
                    className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all"
                />

                <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-full bg-community-tertiary text-white text-sm"
                >
                    {isGenerating ? "Generating..." : "Generate"}
                </button>

            </div>

            {generatedChallenges && (
                <div className="space-y-3">

                    {["easy", "medium", "hard"].map(level => (
                        <div
                            key={level}
                            className="p-3 rounded-xl bg-black/30 border border-white/10"
                        >
                            <div className="flex justify-between items-center">

                                <h4 className="capitalize font-semibold text-community-secondary">
                                    {level}
                                </h4>

                                <button
                                    onClick={() => {
                                        setTitle(`${level.toUpperCase()} Challenge`);
                                        setDescription(generatedChallenges[level]);
                                    }}
                                    className="text-xs px-3 py-1 rounded-full bg-community-secondary text-white"
                                >
                                    Use
                                </button>

                            </div>

                            <p className="text-sm mt-2 text-community-on-surface">
                                {generatedChallenges[level]}
                            </p>

                        </div>
                    ))}

                </div>
            )}

                    <div className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Challenge Title</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="Enter a visionary name..." 
                                type="text"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                placeholder="Describe the creative mission..." 
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Cover Image</label>
                            <div className="w-full border-2 border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:border-community-secondary/50 transition-colors cursor-pointer bg-black/20">
                                <span className="material-symbols-outlined text-2xl text-community-outline">cloud_upload</span>
                                <span className="text-xs text-community-outline">Click to upload challenge banner</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Submission Deadline</label>
                                <input 
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-black/40 border-none rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-2 focus:ring-community-secondary transition-all" 
                                    type="date"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Max Points</label>
                                <input 
                                    value={maxPoints}
                                    onChange={(e) => setMaxPoints(e.target.value)}
                                    className="w-full bg-black/40 border border-transparent focus:border-community-tertiary rounded-xl py-2 px-4 text-sm text-community-on-surface focus:ring-0 transition-all" 
                                    max="100" 
                                    type="number"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-community-outline uppercase tracking-widest">Media Type</label>
                            <div className="flex flex-wrap gap-2">
                                {['Image', 'Audio', 'Video', 'Text'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setMediaType(type)}
                                        className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
                                            mediaType === type 
                                                ? 'bg-community-secondary text-white border-transparent' 
                                                : 'border-white/10 text-community-outline hover:border-white/20'
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

                    <div className="pt-2 space-y-2 relative z-10">
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-2.5 rounded-full font-bold text-white bg-community-secondary hover:bg-community-secondary/90 shadow-lg active:scale-95 transition-all disabled:opacity-50 text-sm"
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

    return createPortal(modalContent, document.body);
};

export default CreateChallengeModal;
