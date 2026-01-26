import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone'; // npm install react-dropzone
import api from '../api/axios';

const UploadArtworkModal = ({ isOpen, closeModal, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

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

            // Reset & Close
            setFile(null);
            setPreview(null);
            setTitle("");
            setDescription("");
            setTags("");
            onUploadSuccess(); // Refresh feed
            closeModal();
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed! Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-6 text-left shadow-2xl transition-all">

                            <div className="flex justify-between items-center mb-6">
                                <Dialog.Title className="text-xl font-bold text-white">Share Your Art</Dialog.Title>
                                <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* LEFT: Image Upload Zone */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64 md:h-auto cursor-pointer transition-colors ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/20 hover:border-white/40 bg-slate-800/50"
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <CloudArrowUpIcon className="w-12 h-12 text-violet-400 mx-auto mb-2" />
                                            <p className="text-slate-300 font-medium">Drag & drop or click</p>
                                            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP up to 10MB</p>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: Form Details */}
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                                            placeholder="e.g. Neon City"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Description</label>
                                        <textarea
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                                            placeholder="Tell us about your process..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Tags</label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                                            placeholder="digital, concept, character (comma separated)"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-auto w-full py-3 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-500 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Publishing..." : "Publish Artwork"}
                                    </button>
                                </form>

                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UploadArtworkModal;