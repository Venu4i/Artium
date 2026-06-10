import React, { useState } from "react";
import api from "../api/axios";

const AiAssistantPage = () => {

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [feedback, setFeedback] =
        useState(null);

    const handleAnalyze = async () => {

        if (!description.trim()) return;

        try {

            setLoading(true);

            const response =
                await api.post(
                    "/ai/art-feedback",
                    {
                        description,
                    }
                );

            setFeedback(
                response.data.data
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    AI Art Mentor
                </h1>

                <p className="text-slate-400">
                    Describe your artwork and
                    receive AI-powered artistic
                    feedback.
                </p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                <textarea
                    rows={8}
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                    placeholder="Describe your artwork..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white resize-none"
                />

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold"
                >
                    {
                        loading
                        ? "Analyzing..."
                        : "🎨 Analyze Artwork"
                    }
                </button>

            </div>

            {
                feedback && (

                    <div className="mt-8 grid gap-6">

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                            <h2 className="text-xl font-bold text-white mb-3">
                                Mood
                            </h2>

                            <p className="text-slate-300">
                                {feedback.mood}
                            </p>

                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                            <h2 className="text-xl font-bold text-white mb-3">
                                Strengths
                            </h2>

                            <ul className="list-disc pl-5 text-slate-300 space-y-2">
                                {
                                    feedback.strengths?.map(
                                        (item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        )
                                    )
                                }
                            </ul>

                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                            <h2 className="text-xl font-bold text-white mb-3">
                                Suggestions
                            </h2>

                            <ul className="list-disc pl-5 text-slate-300 space-y-2">
                                {
                                    feedback.suggestions?.map(
                                        (item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        )
                                    )
                                }
                            </ul>

                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                            <h2 className="text-xl font-bold text-white mb-3">
                                Title Ideas
                            </h2>

                            <div className="flex flex-wrap gap-2">

                                {
                                    feedback.titleIdeas?.map(
                                        (title, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-2 rounded-lg bg-violet-600/20 text-violet-300"
                                            >
                                                {title}
                                            </span>
                                        )
                                    )
                                }

                            </div>

                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">

                            <h2 className="text-xl font-bold text-white mb-3">
                                Caption
                            </h2>

                            <p className="text-slate-300">
                                {feedback.caption}
                            </p>

                        </div>

                    </div>
                )
            }

        </div>
    );
};

export default AiAssistantPage;