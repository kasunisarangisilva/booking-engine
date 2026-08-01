import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    X,
    Check,
    CheckCheck,
    Trash2,
    Bell,
    Calendar,
    Store,
    FileText,
    CheckCircle2,
    Ban,
    UserCheck,
    UserX,
    PlayCircle,
    Clock,
    Eye,
    AlertTriangle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationDrawer() {
    const {
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification
    } = useNotification();

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // { type: 'single' | 'all', id?: string, title?: string }

    const getNotificationDetails = (type) => {
        switch (type) {
            case 'new_booking':
                return {
                    title: 'New Booking Received',
                    icon: <Calendar className="h-5 w-5 text-blue-500" />,
                    bg: 'bg-blue-50 dark:bg-blue-950/30'
                };
            case 'booking_confirmed':
                return {
                    title: 'Booking Confirmed',
                    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
                    bg: 'bg-emerald-50 dark:bg-emerald-950/30'
                };
            case 'new_vendor':
                return {
                    title: 'New Vendor Registered',
                    icon: <Store className="h-5 w-5 text-purple-500" />,
                    bg: 'bg-purple-50 dark:bg-purple-950/30'
                };
            case 'new_listing':
                return {
                    title: 'New Listing Added',
                    icon: <FileText className="h-5 w-5 text-indigo-500" />,
                    bg: 'bg-indigo-50 dark:bg-indigo-950/30'
                };
            case 'vendor_approved':
                return {
                    title: 'Vendor Approved',
                    icon: <UserCheck className="h-5 w-5 text-emerald-500" />,
                    bg: 'bg-emerald-50 dark:bg-emerald-950/30'
                };
            case 'vendor_suspended':
                return {
                    title: 'Vendor Suspended',
                    icon: <Ban className="h-5 w-5 text-amber-500" />,
                    bg: 'bg-amber-50 dark:bg-amber-950/30'
                };
            case 'vendor_activated':
                return {
                    title: 'Vendor Activated',
                    icon: <PlayCircle className="h-5 w-5 text-emerald-500" />,
                    bg: 'bg-emerald-50 dark:bg-emerald-950/30'
                };
            case 'vendor_inactive':
                return {
                    title: 'Vendor Marked Inactive',
                    icon: <UserX className="h-5 w-5 text-rose-500" />,
                    bg: 'bg-rose-50 dark:bg-rose-950/30'
                };
            default:
                return {
                    title: type ? type.replace(/_/g, ' ').toUpperCase() : 'Notification',
                    icon: <Bell className="h-5 w-5 text-slate-500" />,
                    bg: 'bg-slate-50 dark:bg-slate-800'
                };
        }
    };

    const formatTime = (dateInput) => {
        if (!dateInput) return 'Just now';
        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return 'Just now';
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Just now';
        }
    };

    const handleNotificationClick = (notification) => {
        const id = notification._id || notification.id;
        if (!notification.read) {
            markAsRead(id);
        }
        closeDrawer(); // Close side drawer when opening detail modal
        setSelectedNotification({
            ...notification,
            read: true // reflect as seen immediately
        });
    };

    const confirmDeleteSingle = (id) => {
        setDeleteConfirmModal({
            type: 'single',
            id,
            title: 'Delete Notification',
            message: 'Are you sure you want to delete this notification?'
        });
    };

    const confirmClearAll = () => {
        setDeleteConfirmModal({
            type: 'all',
            title: 'Clear All Notifications',
            message: 'Are you sure you want to clear all notifications? This action cannot be undone.'
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirmModal) return;

        if (deleteConfirmModal.type === 'single' && deleteConfirmModal.id) {
            deleteNotification(deleteConfirmModal.id);
            if (selectedNotification && (selectedNotification._id === deleteConfirmModal.id || selectedNotification.id === deleteConfirmModal.id)) {
                setSelectedNotification(null);
            }
        } else if (deleteConfirmModal.type === 'all') {
            clearNotifications();
            setSelectedNotification(null);
        }
        setDeleteConfirmModal(null);
    };

    return (
        <>
            <Transition.Root show={isDrawerOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeDrawer}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-300 sm:duration-500"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-300 sm:duration-500"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-800 shadow-2xl">
                                            {/* Drawer Header */}
                                            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                                            <Bell className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                                                                Notifications
                                                            </Dialog.Title>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Stay updated with system activities
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                                        onClick={closeDrawer}
                                                    >
                                                        <X className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>

                                                {notifications.length > 0 && (
                                                    <div className="mt-4 flex items-center justify-between pt-2">
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Mark all read
                                                        </button>
                                                        <button
                                                            onClick={confirmClearAll}
                                                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Clear all
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Drawer Notification List */}
                                            <div className="relative flex-1 p-4">
                                                {notifications.length === 0 ? (
                                                    <div className="text-center py-16 px-4">
                                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                                                            <Bell className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No notifications yet</h4>
                                                        <p className="mt-1 text-xs text-slate-400">When you receive alerts, they will show up here.</p>
                                                    </div>
                                                ) : (
                                                    <ul className="space-y-2.5">
                                                        {notifications.map((notification) => {
                                                            const details = getNotificationDetails(notification.type);
                                                            const isUnread = !notification.read;
                                                            const notifDate = notification.createdAt || notification.timestamp || notification.time;

                                                            return (
                                                                <li
                                                                    key={notification._id || notification.id}
                                                                    onClick={() => handleNotificationClick(notification)}
                                                                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isUnread
                                                                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                                                                        : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-100 dark:border-slate-700/60'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-2xs shrink-0 mt-0.5">
                                                                            {details.icon}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center justify-between mb-1 gap-2">
                                                                                <h3 className={`text-xs font-bold truncate ${isUnread ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                                    {details.title}
                                                                                </h3>
                                                                                {/* Status Indicator Badge */}
                                                                                {isUnread ? (
                                                                                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-2xs">
                                                                                        NEW
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                                        <CheckCheck className="w-3.5 h-3.5" /> Seen
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className={`text-xs leading-relaxed line-clamp-2 ${isUnread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                                {notification.message}
                                                                            </p>
                                                                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                                                                                <span className="flex items-center gap-1">
                                                                                    <Clock className="w-3 h-3" />
                                                                                    {formatTime(notifDate)}
                                                                                </span>
                                                                                <span className="text-indigo-500 hover:underline font-semibold flex items-center gap-0.5">
                                                                                    View <Eye className="w-3 h-3" />
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* NOTIFICATION VIEW / DETAIL MODAL */}
            {selectedNotification && (() => {
                const details = getNotificationDetails(selectedNotification.type);
                const notifDate = selectedNotification.createdAt || selectedNotification.timestamp || selectedNotification.time;
                const notifId = selectedNotification._id || selectedNotification.id;

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden transform transition-all">
                            {/* Modal Header */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        {details.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {details.title}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            <CheckCheck className="w-4 h-4" /> Seen / Read
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                        {selectedNotification.message}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        Received: {formatTime(notifDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                {deleteNotification && (
                                    <button
                                        onClick={() => confirmDeleteSingle(notifId)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedNotification(null);
                                            openDrawer();
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                                    >
                                        Back to Drawer
                                    </button>
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-xs transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* DELETE CONFIRMATION POPUP MODAL */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center transform transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {deleteConfirmModal.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            {deleteConfirmModal.message}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirmModal(null)}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer transition-colors shadow-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
