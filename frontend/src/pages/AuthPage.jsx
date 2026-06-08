import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import api from "../api/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import PremiumBackground from '../components/PremiumBackground';

const slides = [
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    caption: "Engineer the Avant-Garde.",
    subcaption: "Join a specialized network of creative technologists pushing the boundaries of immersive digital art."
  },
  {
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    caption: "The Obsidian Prism.",
    subcaption: "Experience a UI that adapts to your creative energy."
  },
  {
    src: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2000&auto=format&fit=crop",
    caption: "Connect with Visionaries.",
    subcaption: "Collaborate in real-time within your immersive creative hub."
  },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const res = await api.post('/user/google', {
           email: userInfo.data.email,
           name: userInfo.data.name,
           googleId: userInfo.data.sub,
           profilePicture: userInfo.data.picture
        });
        const { user } = res.data.data;
        dispatch(setCredentials({ user }));
      } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Google Authentication failed");
      } finally {
        setLoading(false);
      }
    },
  });

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

      dispatch(setCredentials({ user }));
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full relative bg-[#09090b] text-[#e8dfee] font-sans antialiased overflow-x-hidden selection:bg-[#d2bbff]/30 selection:text-[#d2bbff]">
      <PremiumBackground />
      
      {/* Left Pane: Immersive Hero Image Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-white/5 bg-black">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slides[index].src}')` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 to-transparent z-10"></div>
        </div>

        {/* Brand Logo Anchor */}
        <div className="relative z-20">
          <h1 className="text-6xl font-extrabold tracking-tighter text-[#d2bbff] drop-shadow-[0_0_20px_rgba(210,187,255,0.6)]">
            Artium.
          </h1>
        </div>

        {/* Contextual Value Prop */}
        <div className="relative z-20 max-w-lg backdrop-blur-md bg-white/5 p-8 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(76,215,246,0.1)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-3xl font-bold text-[#e8dfee] mb-4">
                {slides[index].caption}
              </p>
              <p className="text-lg text-[#ccc3d8]">
                {slides[index].subcaption}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Pane: Glassmorphic Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 lg:p-16 relative">

        {/* Main Form Card */}
        <div className="w-full max-w-[480px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.5)]">
              Artium.
            </h1>
          </div>

          <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
            
            {/* Tabs */}
            <div className="flex w-full border-b border-white/10 relative z-10">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-6 text-center text-xl font-semibold transition-colors duration-300 ${
                  isLogin
                    ? "text-[#d2bbff] border-b-2 border-[#d2bbff] bg-white/5"
                    : "text-[#ccc3d8] hover:text-[#e8dfee]"
                }`}
              >
                Log In
                {isLogin && <div className="absolute bottom-0 left-1/4 w-1/4 h-[1px] bg-[#d2bbff] blur-[2px]"></div>}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-6 text-center text-xl font-semibold transition-colors duration-300 ${
                  !isLogin
                    ? "text-[#d2bbff] border-b-2 border-[#d2bbff] bg-white/5"
                    : "text-[#ccc3d8] hover:text-[#e8dfee]"
                }`}
              >
                Create Account
                {!isLogin && <div className="absolute bottom-0 right-1/4 w-1/4 h-[1px] bg-[#d2bbff] blur-[2px]"></div>}
              </button>
            </div>

            <div className="p-8 sm:p-10 flex flex-col gap-6 relative z-10">
              {/* Google Auth Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/30 hover:bg-white/10 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-[#e8dfee] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-lg">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-xs text-[#958da1] uppercase tracking-widest font-medium">Or</span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative group overflow-hidden"
                    >
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required={!isLogin}
                        placeholder="Username"
                        className="w-full bg-[#050408] border border-white/10 rounded-lg px-4 py-4 text-[#e8dfee] text-lg placeholder-transparent focus:border-[#4cd7f6] focus:ring-0 focus:outline-none transition-all duration-300 peer"
                      />
                      <label
                        htmlFor="username"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none 
                          ${formData.username ? '-top-2 left-3 text-[12px] font-medium tracking-wide bg-[#050408] px-1 text-[#4cd7f6]' : 'top-4 text-lg text-[#ccc3d8] peer-focus:-top-2 peer-focus:left-3 peer-focus:text-[12px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-[#4cd7f6] peer-focus:bg-[#050408] peer-focus:px-1'}
                        `}
                      >
                        Username
                      </label>
                      <div className="absolute inset-0 border border-[#4cd7f6] rounded-lg opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_10px_rgba(76,215,246,0.2)] transition-opacity duration-300 pointer-events-none"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={isLogin ? "Email or Username" : "Email Address"}
                    className="w-full bg-[#050408] border border-white/10 rounded-lg px-4 py-4 text-[#e8dfee] text-lg placeholder-transparent focus:border-[#4cd7f6] focus:ring-0 focus:outline-none transition-all duration-300 peer"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none 
                      ${formData.email ? '-top-2 left-3 text-[12px] font-medium tracking-wide bg-[#050408] px-1 text-[#4cd7f6]' : 'top-4 text-lg text-[#ccc3d8] peer-focus:-top-2 peer-focus:left-3 peer-focus:text-[12px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-[#4cd7f6] peer-focus:bg-[#050408] peer-focus:px-1'}
                    `}
                  >
                    {isLogin ? "Email or Username" : "Email Address"}
                  </label>
                  <div className="absolute inset-0 border border-[#4cd7f6] rounded-lg opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_10px_rgba(76,215,246,0.2)] transition-opacity duration-300 pointer-events-none"></div>
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Password"
                    className="w-full bg-[#050408] border border-white/10 rounded-lg px-4 py-4 pr-12 text-[#e8dfee] text-lg placeholder-transparent focus:border-[#4cd7f6] focus:ring-0 focus:outline-none transition-all duration-300 peer"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none 
                      ${formData.password ? '-top-2 left-3 text-[12px] font-medium tracking-wide bg-[#050408] px-1 text-[#4cd7f6]' : 'top-4 text-lg text-[#ccc3d8] peer-focus:-top-2 peer-focus:left-3 peer-focus:text-[12px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-[#4cd7f6] peer-focus:bg-[#050408] peer-focus:px-1'}
                    `}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-[#ccc3d8] hover:text-[#4cd7f6] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                  <div className="absolute inset-0 border border-[#4cd7f6] rounded-lg opacity-0 peer-focus:opacity-100 peer-focus:shadow-[0_0_10px_rgba(76,215,246,0.2)] transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Submit Action */}
                <div className="mt-6 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#d2bbff] text-[#1a1025] rounded-lg text-xl font-semibold shadow-[0_0_15px_rgba(210,187,255,0.4)] hover:shadow-[0_0_25px_rgba(210,187,255,0.6)] hover:bg-[#eaddff] hover:-translate-y-[1px] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : isLogin ? "Sign In" : "Initialize Account"}
                  </button>
                  <p className="mt-6 text-center text-xs text-[#ccc3d8] opacity-60">
                    By proceeding, you agree to Artium's <a className="text-[#4cd7f6] hover:underline underline-offset-2" href="#">Terms of Service</a> & <a className="text-[#4cd7f6] hover:underline underline-offset-2" href="#">Privacy Policy</a>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}