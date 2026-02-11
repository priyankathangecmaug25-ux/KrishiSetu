import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, User, IndianRupee } from 'lucide-react';

const BookingHistoryModal = ({ isOpen, onClose, machinery, bookings }) => {
    const { t } = useTranslation();

    if (!isOpen || !machinery) return null;

    const history = bookings.filter(b => b.machinery && b.machinery.id === machinery.id)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                            {t('booking_history')}
                        </h2>
                        <p className="text-sm text-primary-600 font-bold uppercase tracking-widest mt-1">
                            {machinery.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">{t('no_bookings_yet')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((booking) => (
                                <div key={booking.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <User size={16} className="text-primary-500" />
                                            <span>{booking.farmer ? `${booking.farmer.firstName} ${booking.farmer.lastName}` : t('unknown')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-slate-900 font-black font-outfit justify-end">
                                                <IndianRupee size={16} />
                                                <span>{booking.amount}</span>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-center mt-1
                                                ${booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                    booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        booking.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-200 text-slate-600'
                                                }
                                            `}>
                                                {booking.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingHistoryModal;
