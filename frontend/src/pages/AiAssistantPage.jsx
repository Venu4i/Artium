import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import axios from "axios";

export default function AiAssistantPage() {

    const [activeTab, setActiveTab] =
        useState("feedback");

    const [loading, setLoading] =
        useState(false);

    // Feedback

    const [description, setDescription] =
        useState("");

    const [artType, setArtType] =
        useState("");

    const [feedbackMode, setFeedbackMode] =
        useState("Professional");

    const [feedback, setFeedback] =
        useState(null);

    // Ideas

    const [topic, setTopic] =
        useState("");

    const [ideaArtType, setIdeaArtType] =
        useState("");

    const [ideas, setIdeas] =
        useState([]);

    const getFeedback = async () => {
        try {

            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/v1/ai/art-feedback",
                {
                    description,
                    artType,
                    feedbackMode
                }
            );

            setFeedback(res.data.data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);
        }
    };

    const generateIdeas = async () => {

        try {

            setLoading(true);

            const res = await axios.post(
                "http://localhost:5000/api/v1/ai/creative-ideas",
                {
                    topic,
                    artType: ideaArtType
                }
            );

            setIdeas(
                res.data.data.ideas || []
            );

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* Header */}

            <div className="mb-10">

                <h1 className="text-5xl font-black text-white mb-3">
                    AI Studio
                </h1>

                <p className="text-slate-400 text-lg">
                    Enhance creativity with AI powered mentoring.
                </p>

            </div>

            {/* Tabs */}

            <div className="flex gap-4 mb-8">

                <button
                    onClick={() =>
                        setActiveTab("feedback")
                    }
                    className={`px-6 py-3 rounded-xl font-semibold transition ${
                        activeTab === "feedback"
                            ? "bg-violet-600 text-white"
                            : "bg-slate-900 text-slate-400"
                    }`}
                >
                    🎨 Art Feedback
                </button>

                <button
                    onClick={() =>
                        setActiveTab("ideas")
                    }
                    className={`px-6 py-3 rounded-xl font-semibold transition ${
                        activeTab === "ideas"
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-900 text-slate-400"
                    }`}
                >
                    💡 Creative Ideas
                </button>

            </div>

            <AnimatePresence mode="wait">

                {/* ---------------- FEEDBACK ---------------- */}

                {
                    activeTab === "feedback" && (

                        <motion.div
                            key="feedback"
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0
                            }}
                            className="space-y-6"
                        >

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

                                <h2 className="text-2xl font-bold text-white mb-6">
                                    Artwork Analysis
                                </h2>

                                <textarea
                                    rows={6}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe your artwork..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white"
                                />

                                <div className="grid md:grid-cols-2 gap-4 mt-4">

                                    <input
                                        type="text"
                                        value={artType}
                                        onChange={(e) =>
                                            setArtType(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Art Type"
                                        className="bg-black/30 border border-white/10 rounded-xl p-3 text-white"
                                    />

                                    <select
                                        value={feedbackMode}
                                        onChange={(e) =>
                                            setFeedbackMode(
                                                e.target.value
                                            )
                                        }
                                        className="bg-black/30 border border-white/10 rounded-xl p-3 text-white"
                                    >
                                        <option>
                                            Professional
                                        </option>

                                        <option>
                                            Beginner
                                        </option>

                                        <option>
                                            Advanced
                                        </option>

                                    </select>

                                </div>

                                <button
                                    onClick={getFeedback}
                                    disabled={loading}
                                    className="mt-6 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                                >
                                    {
                                        loading
                                            ? "Analyzing..."
                                            : "Analyze Artwork"
                                    }
                                </button>

                            </div>

                            {
                                feedback && (

                                    <div className="grid lg:grid-cols-2 gap-6">

                                        <Card
                                            title="Detected Mood"
                                            content={
                                                feedback.detectedMood
                                            }
                                        />

                                        <Card
                                            title="Creativity Score"
                                            content={
                                                feedback.creativityScore
                                            }
                                        />

                                        <ListCard
                                            title="Strengths"
                                            items={
                                                feedback.strengths
                                            }
                                        />

                                        <ListCard
                                            title="Improvements"
                                            items={
                                                feedback.improvements
                                            }
                                        />

                                        <ListCard
                                            title="Title Ideas"
                                            items={
                                                feedback.titleIdeas
                                            }
                                        />

                                        <ListCard
                                            title="Next Steps"
                                            items={
                                                feedback.nextSteps
                                            }
                                        />

                                    </div>
                                )
                            }

                        </motion.div>
                    )
                }

                {/* ---------------- IDEAS ---------------- */}

                {
                    activeTab === "ideas" && (

                        <motion.div
                            key="ideas"
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0
                            }}
                            className="space-y-6"
                        >

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

                                <h2 className="text-2xl font-bold text-white mb-6">
                                    Generate Creative Ideas
                                </h2>

                                <input
                                    value={topic}
                                    onChange={(e) =>
                                        setTopic(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Topic..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white"
                                />

                                <input
                                    value={ideaArtType}
                                    onChange={(e) =>
                                        setIdeaArtType(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Art Type..."
                                    className="w-full mt-4 bg-black/30 border border-white/10 rounded-xl p-4 text-white"
                                />

                                <button
                                    onClick={generateIdeas}
                                    disabled={loading}
                                    className="mt-6 px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                                >
                                    {
                                        loading
                                            ? "Generating..."
                                            : "Generate Ideas"
                                    }
                                </button>

                            </div>

                            {
                                ideas.length > 0 && (

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                                        {
                                            ideas.map(
                                                (
                                                    idea,
                                                    index
                                                ) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0
                                                        }}
                                                        className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl"
                                                    >
                                                        <div className="text-cyan-400 font-bold mb-2">
                                                            Idea #{index + 1}
                                                        </div>

                                                        <p className="text-slate-300">
                                                            {idea}
                                                        </p>
                                                    </motion.div>
                                                )
                                            )
                                        }

                                    </div>
                                )
                            }

                        </motion.div>
                    )
                }

            </AnimatePresence>

        </div>
    );
}

function Card({ title, content }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-3">
                {title}
            </h3>

            <p className="text-slate-300">
                {content}
            </p>
        </div>
    );
}

function ListCard({ title, items }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-3">
                {title}
            </h3>

            <ul className="space-y-2">

                {items?.map((item, index) => (
                    <li
                        key={index}
                        className="text-slate-300"
                    >
                        • {item}
                    </li>
                ))}

            </ul>
        </div>
    );
}