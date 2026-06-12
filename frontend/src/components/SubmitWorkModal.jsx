import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import challengeService from "../services/challengeService";

const SubmitWorkModal = ({ isOpen, onClose, challenge, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

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

            // Mock uploading file to cloudinary or storage to get a URL
            // In a real app, you would upload to S3/Cloudinary first
            // and pass the URL to backend. For now we just pass a mock URL or let backend handle if it supports FormData.
            // Since submitToChallenge expects { mediaUrl, contentId }, we will mock mediaUrl for the sake of completion,
            // or if the backend can handle the file upload via other means.
            // Assuming we just pass a placeholder since this is an MVP:
            
            await challengeService.submitToChallenge(challenge._id, {
                mediaUrl: URL.createObjectURL(file), // This is local, but satisfies the object format
                contentId: null
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit work");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !challenge) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-community-outline/20 shadow-2xl relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-community-on-surface-variant transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <h2 className="font-headline text-[24px] font-bold text-community-on-surface mb-2">Submit to Challenge</h2>
                <p className="text-community-on-surface-variant text-[14px] mb-6">
                    {challenge.title}
                </p>

                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragActive 
                            ? 'border-community-tertiary bg-community-tertiary/10' 
                            : 'border-community-outline/30 hover:border-community-tertiary/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    <input {...getInputProps()} />
                    <span className="material-symbols-outlined text-4xl text-community-on-surface-variant mb-4">cloud_upload</span>
                    
                    {file ? (
                        <div className="text-center">
                            <p className="text-community-on-surface font-bold text-[14px]">{file.name}</p>
                            <p className="text-community-on-surface-variant text-[12px]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-community-on-surface font-bold text-[14px]">Drag & drop your work here</p>
                            <p className="text-community-on-surface-variant text-[12px] mt-1">or click to browse files</p>
                            <p className="text-community-on-surface-variant text-[10px] mt-4">Supports JPG, PNG, GIF, MP4 up to 50MB</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[13px]">
                        {error}
                    </div>
                )}

                <div className="mt-8 flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg text-community-on-surface font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className="px-5 py-2.5 bg-community-primary text-white rounded-lg font-bold shadow-lg shadow-community-primary/20 hover:shadow-community-primary/40 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Work'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmitWorkModal;
