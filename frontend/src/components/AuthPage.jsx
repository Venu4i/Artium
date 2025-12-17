import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Hook for navigation
import axios from "axios";

const slides = [
    {
        src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2560&q=80",
        caption: "Capture Moments, Create Stories 📸",
    },
    {
        src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2940&q=80",
        caption: "Where Passion Meets Art 🎨",
    },
    {
        src: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=2762&q=80",
        caption: "Dream. Express. Inspire. ✨",
    },
];

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [index, setIndex] = useState(0);
    const navigate = useNavigate(); // ✅ Initialize Navigate Hook

    // State for Form Data
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        identifier: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const BASE_URL = "http://localhost:5000/api/v1/user";

            if (isLogin) {
                // --- LOGIN LOGIC ---
                const response = await axios.post(`${BASE_URL}/login`, {
                    identifier: formData.identifier,
                    password: formData.password,
                });

                console.log("Login Success:", response.data);

                // 1. Save Token
                localStorage.setItem("accessToken", response.data.data.accessToken);

                // 2. Alert & Navigate
                alert(`Welcome back! ${response.data.data.user.username}`);
                navigate("/community"); // ✅ Navigate to Community

            } else {
                // --- SIGNUP LOGIC ---
                const response = await axios.post(`${BASE_URL}/register`, {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                });

                console.log("Signup Success:", response.data);

                // ✅ Since your backend returns tokens on signup, we can auto-login!
                localStorage.setItem("accessToken", response.data.data.accessToken);
                
                alert("Account created! Redirecting...");
                navigate("/community"); // ✅ Navigate to Community
            }
        } catch (error) {
            console.error("Auth Error:", error);
            const errMsg = error.response?.data?.message || "Something went wrong";
            alert(`Error: ${errMsg}`);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1625] text-white p-4">
            <div className="flex flex-col md:flex-row bg-[#241f36] rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full">
                {/* Left Side: Slideshow */}
                <div className="w-full md:w-1/2 relative h-[550px] overflow-hidden">
                    <div
                        className="flex transition-transform duration-700 ease-in-out h-full"
                        style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                        {slides.map((slide, i) => (
                            <img
                                key={i}
                                src={slide.src}
                                alt={`slide-${i}`}
                                className="w-full h-full object-cover flex shrink-0 p-4"
                            />
                        ))}
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end from-black/70 via-transparent to-transparent p-8">
                        <p className="text-xl md:text-2xl font-semibold mb-4 drop-shadow-lg text-center">
                            {slides[index].caption}
                        </p>
                        <div className="flex justify-center gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === i ? "bg-white scale-125" : "bg-gray-400"
                                        }`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login / Signup */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-2">
                        {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
                    </h2>
                    <p className="text-gray-400 mb-8">
                        {isLogin ? (
                            <>
                                Don’t have an account?{" "}
                                <button
                                    className="text-blue-400 hover:underline"
                                    onClick={() => setIsLogin(false)}
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    className="text-blue-400 hover:underline"
                                    onClick={() => setIsLogin(true)}
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {!isLogin && (
                            <input
                                type="text"
                                name="username"
                                placeholder="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                            />
                        )}

                        {isLogin ? (
                            <input
                                type="text"
                                name="identifier"
                                placeholder="username or Email"
                                value={formData.identifier}
                                onChange={handleChange}
                                className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                            />
                        ) : (
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                            />
                        )}

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-semibold transition"
                        >
                            {isLogin ? "Log In" : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}