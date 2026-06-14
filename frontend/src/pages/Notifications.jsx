import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../services/notificationService';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationService.getNotifications();
                setNotifications(res.data);
                // Mark all as read when visited
                await notificationService.markAllAsRead();
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={handleBack}
                        className="p-2 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BellAlertIcon className="w-8 h-8 text-cyan-500" />
                        Notifications
                    </h1>
                </div>

                {/* Main Container */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <CheckCircleIcon className="w-16 h-16 text-cyan-500/50 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All caught up!</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">You have no new notifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notif) => (
                                <div 
                                    key={notif._id}
                                    className={`group flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 border hover:shadow-lg ${
                                        notif.read 
                                            ? 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30' 
                                            : 'bg-cyan-50/80 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-500/30 shadow-sm'
                                    }`}
                                >
                                    {notif.owner && (
                                        <div className="relative shrink-0">
                                            <img 
                                                src={notif.owner.profilePicture} 
                                                alt={notif.owner.username} 
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                                            />
                                            {!notif.read && (
                                                <span className="absolute top-0 right-0 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white dark:border-zinc-800"></span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className="text-slate-800 dark:text-slate-200 text-base leading-snug">
                                            {notif.owner && <span className="font-bold text-slate-900 dark:text-white mr-1.5">{notif.owner.username}</span>}
                                            <span className="opacity-90">{notif.message}</span>
                                        </p>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 block">
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
