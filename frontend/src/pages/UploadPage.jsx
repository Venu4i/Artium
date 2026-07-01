import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage = () => {
    const navigate = useNavigate();

    // State
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [enhanceLoading, setEnhanceLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Drag & Drop Logic
    const onDrop = (acceptedFiles) => {
        const selected = acceptedFiles[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
    };

    const handleEnhanceDescription = async () => {
        if (!description.trim()) return;
        try {
            setEnhanceLoading(true);
            const response = await api.post("/ai/enhance-description", { description });
            setDescription(response.data.enhancedDescription);
        } catch (error) {
            console.error(error);
        } finally {
            setEnhanceLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return alert("Image and title are required!");

        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("tags", tags);

        try {
            await api.post("/artworks/upload", formData);
            navigate('/feed');
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed! Check console.");
            setLoading(false);
        }
    };

    const handleGenerateTags = async () => {
        if (!description.trim()) return;
        try {
            setTagsLoading(true);
            const response = await api.post("/ai/generate-tags", { description });
            setTags(response.data.tags.join(", "));
        } catch (error) {
            console.error(error);
        } finally {
            setTagsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] w-full py-12 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl w-full mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                        Publish your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Masterpiece</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Share your creative journey. Upload your latest work, add the story behind it, and let the community experience your vision.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
                    {/* Left: Dropzone */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="h-full min-h-[400px] lg:min-h-[600px] w-full"
                    >
                        <div
                            {...getRootProps()}
                            className={`w-full h-full rounded-[2rem] border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                                isDragActive
                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 scale-[1.02] shadow-2xl shadow-violet-500/20"
                                    : preview 
                                        ? "border-transparent bg-slate-100 dark:bg-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/50" 
                                        : "border-dashed border-slate-300 dark:border-white/10 hover:border-violet-400 dark:hover:border-white/30 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:bg-white dark:hover:bg-white/10 shadow-sm"
                            }`}
                        >
                            <input {...getInputProps()} />

                            <AnimatePresence mode="wait">
                                {preview ? (
                                    <motion.div 
                                        key="preview"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full h-full relative p-2"
                                    >
                                        <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative bg-slate-900/5 dark:bg-black/40">
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            className="absolute top-6 right-6 p-3 bg-white/90 dark:bg-black/60 hover:bg-red-500 hover:text-white text-slate-700 dark:text-white rounded-full transition-all duration-300 shadow-xl backdrop-blur-md transform hover:scale-110 hover:rotate-90 z-20"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="upload-prompt"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center p-8 flex flex-col items-center"
                                    >
                                        <div className="w-24 h-24 mb-6 rounded-full bg-violet-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-200 dark:group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                                            <CloudArrowUpIcon className="w-12 h-12 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drag & drop image</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6">or click to browse your files</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            High-res JPG, PNG, WEBP (Max 10MB)
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            
                            {/* Title Input */}
                            <div className="relative group">
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none font-semibold ${
                                    focusedInput === 'title' || title
                                    ? 'top-2 text-[10px] text-violet-500 dark:text-violet-400 uppercase tracking-widest'
                                    : 'top-4 text-sm text-slate-400 dark:text-slate-500'
                                }`}>
                                    Artwork Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onFocus={() => setFocusedInput('title')}
                                    onBlur={() => setFocusedInput(null)}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-2xl pt-6 pb-2 px-4 text-slate-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500/50 focus:bg-white dark:focus:bg-black/40 transition-all font-medium"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="relative group flex flex-col">
                                <div className="relative">
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none font-semibold ${
                                        focusedInput === 'description' || description
                                        ? 'top-2 text-[10px] text-violet-500 dark:text-violet-400 uppercase tracking-widest'
                                        : 'top-4 text-sm text-slate-400 dark:text-slate-500'
                                    }`}>
                                        The Story Behind the Art
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onFocus={() => setFocusedInput('description')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-2xl pt-6 pb-2 px-4 text-slate-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500/50 focus:bg-white dark:focus:bg-black/40 transition-all font-medium resize-none"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={handleEnhanceDescription}
                                        disabled={enhanceLoading || !description}
                                        className="group/btn flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <SparklesIcon className={`w-4 h-4 ${enhanceLoading ? 'animate-spin' : 'group-hover/btn:animate-pulse'}`} />
                                        {enhanceLoading ? "Enhancing..." : "AI Enhance"}
                                    </button>
                                </div>
                            </div>

                            {/* Tags Input */}
                            <div className="relative group flex flex-col">
                                <div className="relative">
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none font-semibold ${
                                        focusedInput === 'tags' || tags
                                        ? 'top-2 text-[10px] text-violet-500 dark:text-violet-400 uppercase tracking-widest'
                                        : 'top-4 text-sm text-slate-400 dark:text-slate-500'
                                    }`}>
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onFocus={() => setFocusedInput('tags')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border-2 border-slate-100 dark:border-white/5 rounded-2xl pt-6 pb-2 px-4 text-slate-900 dark:text-white outline-none focus:border-violet-500 dark:focus:border-violet-500/50 focus:bg-white dark:focus:bg-black/40 transition-all font-medium"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateTags}
                                        disabled={tagsLoading || !description}
                                        className="group/btn flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <TagIcon className={`w-4 h-4 ${tagsLoading ? 'animate-spin' : ''}`} />
                                        {tagsLoading ? "Generating..." : "Auto Tags"}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 mt-2 border-t border-slate-200 dark:border-white/10">
                                <button
                                    type="submit"
                                    disabled={loading || !file || !title}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group/submit ${
                                        loading || !file || !title
                                            ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                            : "bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-xl shadow-slate-900/20 dark:shadow-white/20"
                                    }`}
                                >
                                    {/* Hover gradient effect for enabled button */}
                                    {(!loading && file && title) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300" />
                                    )}
                                    
                                    <span className="relative z-10 flex items-center gap-2 group-hover/submit:text-white transition-colors">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                Publishing to Feed...
                                            </>
                                        ) : (
                                            "Publish Masterpiece"
                                        )}
                                    </span>
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;