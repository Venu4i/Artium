import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../api/axios";

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/user/login" : "/user/register";
      const payload = isLogin
        ? { identifier: formData.email.trim().toLowerCase(), password: formData.password }
        : {
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        };

      const response = await api.post(endpoint, payload);
      const { user } = response.data.data;

      // Tokens are in httpOnly cookies; Redux only holds user for UI.
      dispatch(setCredentials({ user }));
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1625] text-white p-4">
      <div className="flex flex-col md:flex-row bg-[#241f36] rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full">

        {/* Left Side: Slideshow */}
        {/* RESPONSIVE: h-64 on mobile, h-[600px] on desktop */}
        <div className="w-full md:w-1/2 relative h-64 md:h-[600px] overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <img key={i} src={slide.src} alt="slide" className="w-full h-full object-cover flex shrink-0 p-2 md:p-4 rounded-[2rem]" />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 p-6 md:p-8 text-center">
            <p className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 drop-shadow-lg">{slides[index].caption}</p>
          </div>
        </div>

        {/* Right Side: Form */}
        {/* RESPONSIVE: p-6 on mobile, p-12 on desktop */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{isLogin ? "Welcome Back 👋" : "Create an Account ✨"}</h2>
          <button className="text-violet-400 hover:underline mb-6 md:mb-8 self-start text-sm md:text-base" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleInputChange} className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:border-violet-500 outline-none transition-colors" required />
            )}
            <input name="email" type="text" placeholder={isLogin ? "Email or Username" : "Email"} value={formData.email} onChange={handleInputChange} className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:border-violet-500 outline-none transition-colors" required />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full bg-transparent border border-gray-600 rounded-xl px-4 py-3 focus:border-violet-500 outline-none transition-colors" required />
            <button type="submit" disabled={loading} className="w-full bg-violet-600 py-3 rounded-xl font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-600/20">
              {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}