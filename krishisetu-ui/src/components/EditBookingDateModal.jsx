import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const EditBookingDateModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const { t } = useTranslation();

    // Initialize state with empty strings
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Update state when booking prop changes
    useEffect(() => {
        if (booking) {
            setStartDate(booking.startDate || '');
            setEndDate(booking.endDate || '');
        }
    }, [booking]);

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/owner/bookings/${booking.id}/date`, {
                startDate,
                endDate
            });
            toast.success(t('date_updated_success') || 'Date updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(t('date_update_fail') || 'Failed to update date');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-2">
                        <Calendar className="text-primary-600" size={24} />
                        {t('change_dates') || 'Change Dates'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">


                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('new_end_date') || 'Machinery Return Date'}</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-slate-700 transition-all"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate} // Can't be before start date
                                required
                            />
                            <p className="text-[10px] text-slate-400 font-bold px-1">
                                * This will be the new end date of the booking.
                            </p>
                        </div>


                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t('save_changes') || 'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookingDateModal;
