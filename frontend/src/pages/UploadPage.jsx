import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone'; // npm install react-dropzone
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

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

        if (!description.trim()) {
            return;
        }

        try {

            setEnhanceLoading(true);

            const response =
            await api.post(
                "/ai/enhance-description",
                {
                    description
                }
            );
            console.log(response.data);

            setDescription(
                response.data.enhancedDescription
            );

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
            // On success, redirect to feed
            navigate('/feed');
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed! Check console.");
            setLoading(false);
        }
    };

    const handleGenerateTags = async () => {

        if (!description.trim()) {
            return;
        }

        try {

            setTagsLoading(true);

            const response = await api.post( "/ai/generate-tags", { description} );

            console.log("Generated Tags:", response.data.tags);

            setTags(
                response.data.tags.join(", ")
            );

            

        } catch (error) {

            console.error(error);

        } finally {

            setTagsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Artwork</h1>
                <p className="text-slate-400">Share your latest creation with the community.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/*  Image Upload Zone */}
                {/* h-64 on mobile, full height on desktop */}
                <div className="h-full">
                    <div
                        {...getRootProps()}
                        className={`h-64 lg:h-[500px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${isDragActive
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-white/10 hover:border-white/30 bg-slate-900"
                            }`}
                    >
                        <input {...getInputProps()} />

                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                                {/* Remove Button */}
                                <button
                                    onClick={removeFile}
                                    className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CloudArrowUpIcon className="w-8 h-8 text-violet-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Upload your masterpiece</h3>
                                <p className="text-slate-400 text-sm mb-4">Drag & drop or click to browse</p>
                                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                                    JPG, PNG, WEBP up to 10MB
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Form Details */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5">

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Title *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                            placeholder="e.g. Cyberpunk Cityscape"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                        <textarea
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600 resize-none"
                            placeholder="Tell us about the tools, inspiration, or process..."
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">

                        <button
                            type="button"
                            onClick={handleEnhanceDescription}
                            disabled={enhanceLoading}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm text-white transition"
                        >
                            {
                                enhanceLoading
                                    ? "Generating..."
                                    : "✨ Enhance Description"
                            }
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateTags}
                            disabled={tagsLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition"
                        >
                            {
                                tagsLoading
                                    ? "Generating..."
                                    : "🏷️ Generate Tags"
                            }
                        </button>

                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Tags</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">#</span>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 pl-8 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                placeholder="digitalart, 3d, concept (comma separated)"
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !file
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-1"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Artwork"
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default UploadPage;