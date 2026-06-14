import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import challengeService from "../services/challengeService";

const SubmitWorkModal = ({ isOpen, onClose, challenge, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [isEarly, setIsEarly] = useState(false);

    useEffect(() => {
        if (!challenge) return;
        const updateTimer = () => {
            const now = new Date().getTime();
            const deadline = new Date(challenge.deadline).getTime();
            const diff = deadline - now;
            
            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
                
                // Early bonus active if more than 24 hours remaining
                setIsEarly(hours > 24);
            } else {
                setTimeLeft("00:00:00");
                setIsEarly(false);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [challenge]);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.webm']
        },
        maxFiles: 1
    });

    const handleSubmit = async () => {
        if (!file) {
            setError("Please select a file to submit");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("description", description);
            
            await challengeService.submitToChallenge(challenge._id, formData);

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit work");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !challenge) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10 font-body">
            {/* Modal Container */}
            <div className="bg-white/80 dark:bg-[#1b1b21]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-90 z-20"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                
                {/* Modal Content (Scrollable) */}
                <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Header Section */}
                    <header className="mb-6">
                        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">{challenge.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                            Submit by {new Date(challenge.deadline).toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' })}
                        </p>
                        
                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-3 items-center mt-3">
                            <div className="flex items-center gap-2 bg-[#95406e]/10 px-3 py-1.5 rounded-full border border-[#95406e]/20">
                                <span className="material-symbols-outlined text-[#95406e] text-sm" style={{fontVariationSettings: "'FILL' 1"}}>diamond</span>
                                <span className="text-[#95406e] font-mono text-sm font-medium">{challenge.rewardPoints || 1000} MAX</span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                <span className="material-symbols-outlined text-amber-600 text-sm">schedule</span>
                                <span className="text-amber-700 dark:text-amber-500 font-mono text-sm font-medium">{timeLeft}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#006876]/10 px-3 py-1.5 rounded-full border border-[#006876]/20">
                                <span className="material-symbols-outlined text-[#006876] text-sm">group</span>
                                <span className="text-[#006876] font-mono text-sm font-medium">COMMUNITY SUBMISSION</span>
                            </div>
                        </div>
                    </header>
                    
                    <div className="space-y-6">
                        {/* Upload Section */}
                        <section>
                            <div 
                                {...getRootProps()}
                                className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all cursor-pointer relative overflow-hidden ${
                                    isDragActive || file
                                        ? 'border-[#95406e] bg-[#95406e]/5' 
                                        : 'border-slate-300 dark:border-slate-600 hover:border-[#95406e] hover:bg-[#95406e]/5'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-[#95406e]/10 group-hover:text-[#95406e] transition-colors">
                                    <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                                </div>
                                <div className="text-center">
                                    {file ? (
                                        <>
                                            <p className="text-slate-900 dark:text-white font-bold text-base">{file.name}</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-slate-900 dark:text-white font-bold text-base">Drag & drop your work here</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">PNG, JPG, or MP4 up to 50MB</p>
                                        </>
                                    )}
                                </div>
                                <input {...getInputProps()} aria-label="Upload File" className="hidden" />
                            </div>
                        </section>
                        
                        {/* Description Section */}
                        <section>
                            <label className="block text-slate-900 dark:text-white font-medium mb-1 text-sm">Tell us about your work</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#131316] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#006876]/40 focus:border-[#006876] outline-none transition-all resize-none" 
                                placeholder="Describe your creative process, the tools used, and the story behind your piece..." 
                                rows="4"
                            ></textarea>
                        </section>
                        
                        {/* Bonus Indicator */}
                        {isEarly && (
                            <section>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4 animate-pulse hover:animate-none transition-all">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600">
                                        <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                                    </div>
                                    <div>
                                        <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-base">⚡ Early submission bonus</h4>
                                        <p className="text-emerald-600/80 text-sm mt-0.5">Submit within the next 24 hours to earn a <span className="font-mono font-bold">1.2x</span> point multiplier!</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer Section */}
                <footer className="p-6 md:px-10 md:py-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 dark:border-white/10 mt-auto bg-white/50 dark:bg-[#0e0e11]/50 backdrop-blur-md">
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-full font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95 text-base disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-[#95406e] to-[#006876] text-white font-bold shadow-lg hover:shadow-[#95406e]/30 transition-all active:scale-95 text-base disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                        style={{ boxShadow: isSubmitting ? 'none' : '0 0 15px rgba(149, 64, 110, 0.4)' }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Work'
                        )}
                    </button>
                </footer>
                
                {/* Decorative Mesh Overlay */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#95406e]/15 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#006876]/15 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default SubmitWorkModal;
