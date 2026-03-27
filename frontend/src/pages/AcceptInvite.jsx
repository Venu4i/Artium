import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import communityService from '../services/communityService';

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyInvite = async () => {
            try {
                const response = await communityService.acceptInviteLink(token);
                navigate(`/community/${response.communityId}`);
            } catch (err) {
                setError('Link expired or invalid.');
            } finally {
                setLoading(false);
            }
        };

        verifyInvite();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="max-w-md w-full p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center">
                {loading ? (
                    <>
                        <motion.div
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 animate-spin"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <p className="mt-4 text-white">Verifying Invite...</p>
                    </>
                ) : error ? (
                    <>
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => navigate('/explore-communities')}
                            className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                        >
                            Back to Explore
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default AcceptInvite;