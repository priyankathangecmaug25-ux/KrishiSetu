import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import { Tractor, Calendar, Wallet, CheckCircle, Clock, Plus, Trash2, History, Edit } from 'lucide-react';
import AddMachineryModal from '../components/AddMachineryModal';
import BookingHistoryModal from '../components/BookingHistoryModal';
import EditBookingDateModal from '../components/EditBookingDateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import defaultMachineryImage from '../assets/machinery_demo.png';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const OwnerDashboard = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [machinery, setMachinery] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isEditDateModalOpen, setIsEditDateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMachinery, setSelectedMachinery] = useState(null);
    const [selectedBookingForDate, setSelectedBookingForDate] = useState(null);
    const [machineryToDelete, setMachineryToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const location = useLocation();

    useEffect(() => {
        const hash = location.hash;
        const targetId = hash || '#top';

        setTimeout(() => {
            const element = document.querySelector(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }, [location.hash, loading]);

    const fetchData = async () => {
        try {
            // detailed authentication check
            const isOwner = user?.roles?.includes('ROLE_OWNER') || user?.role === 'MACHINERY_OWNER';

            // Only fetch machinery if user is an owner
            const machineryPromise = isOwner
                ? api.get('/owner/machinery/mine')
                : Promise.resolve({ data: [] });

            const [macRes, bookRes] = await Promise.all([
                machineryPromise,
                api.get('/owner/bookings')
            ]);

            setMachinery(macRes.data);
            setBookings(bookRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setMachineryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!machineryToDelete) return;

        try {
            await api.delete(`/owner/machinery/${machineryToDelete}`);
            setMachinery(machinery.filter(m => m.id !== machineryToDelete));
            toast.success(t('machinery_deleted_success') || "Machinery deleted successfully");
            setIsDeleteModalOpen(false);
            setMachineryToDelete(null);
        } catch (err) {
            console.error("Failed to delete machinery:", err);
            toast.error(t('delete_machinery_fail'));
        }
    };

    // Helper to find the relevant active booking for a machine
    const getActiveBooking = (machineryId) => {
        // Find bookings that are PAID, CONFIRMED or APPROVED (Approved = booked for search purposes)
        // Sort by start date to get the most relevant one (likely the upcoming one)
        const activeBookings = bookings
            .filter(b => b.machinery && b.machinery.id === machineryId)
            .filter(b => ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'PAID', 'COMPLETED'].includes(b.status) || b.paymentStatus === 'PAID')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Return detailed object or null
        return activeBookings.length > 0 ? activeBookings[0] : null;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
    );

    return (
        <DashboardShell title={t('my_machinery_dashboard')}>
            <div id="top" className="space-y-8">
                {/* Owner Stats */}
                <div id="earnings" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <StatCard
                        label={t('active_machinery')}
                        value={machinery.length}
                        icon={Tractor}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        label={t('new_requests')}
                        value={bookings.filter(b => b.status === 'PENDING_APPROVAL').length}
                        icon={Clock}
                        color="bg-amber-500"
                    />
                    <StatCard
                        label={t('my_total_earnings')}
                        value={`₹${bookings.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.amount : 0), 0)}`}
                        icon={Wallet}
                        color="bg-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Recent Activity List */}
                    <div className="xl:col-span-2 space-y-8">
                        <section id="requests" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">{t('recent_booking_requests')}</h3>
                                <button className="text-primary-600 font-bold text-sm hover:underline italic">{t('check_all')}</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {bookings.length === 0 ? (
                                    <div className="p-20 text-center text-slate-500">{t('no_bookings_yet')}</div>
                                ) : (
                                    bookings.map(b => (
                                        <div key={b.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 uppercase italic tracking-tighter">{b.machinery ? b.machinery.name : (b.workerProfile ? b.workerProfile.worker.firstName : t('unknown'))}</p>
                                                    <p className="text-sm text-slate-500">{t('farmer_label')} <span className="font-bold text-slate-700">{b.farmer ? b.farmer.firstName : t('unknown')}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900 font-outfit">₹{b.amount}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{t('total_amount')}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className={`
                                                px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase text-center
                                                ${b.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                                            b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                                                b.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-slate-100 text-slate-700'}
                                              `}>
                                                        {b.status.replace('_', ' ')}
                                                    </span>
                                                    {b.status === 'PENDING_APPROVAL' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.put(`/owner/bookings/${b.id}/APPROVED`);
                                                                        fetchData();
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                        toast.error(t('approve_fail'));
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                {t('approve_btn')}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.put(`/owner/bookings/${b.id}/REJECTED`);
                                                                        fetchData();
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                        toast.error(t('reject_fail'));
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-200 transition-colors"
                                                            >
                                                                {t('reject_btn')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                                }
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Fleet List */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase italic">{t('my_machinery')}</h3>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 px-4 shadow-lg shadow-primary-600/20"
                            >
                                <Plus size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">{t('add_new')}</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {machinery.map(m => {
                                const activeBooking = getActiveBooking(m.id);
                                const isCurrentlyBooked = activeBooking && (() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const end = new Date(activeBooking.endDate);
                                    end.setHours(0, 0, 0, 0);
                                    return end >= today;
                                })();

                                return (
                                    <div key={m.id} className="group p-4 rounded-2xl border border-slate-100 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary-50 transition-colors flex items-center justify-center overflow-hidden">
                                                <img src={m.imageUrl || defaultMachineryImage} alt={m.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate uppercase italic">{m.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-500 font-bold tracking-widest italic">₹{m.ratePerDay}/Day</p>

                                                </div>
                                            </div>

                                            {!isCurrentlyBooked && (
                                                <div className={`w-2 h-2 rounded-full ${m.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            )}

                                            <div className="flex gap-2">



                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMachinery(m);
                                                        setIsHistoryModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                    title={t('view_history')}
                                                >
                                                    <History size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(m.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title={t('delete_machinery')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>

                {isAddModalOpen && (
                    <AddMachineryModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={() => {
                            setIsAddModalOpen(false);
                            fetchData();
                        }}
                    />
                )}

                <BookingHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    machinery={selectedMachinery}
                    bookings={bookings}
                />

                <EditBookingDateModal
                    isOpen={isEditDateModalOpen}
                    onClose={() => setIsEditDateModalOpen(false)}
                    booking={selectedBookingForDate}
                    onSuccess={() => {
                        setIsEditDateModalOpen(false);
                        fetchData();
                    }}
                />

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('delete_machinery_title') || "Delete Machinery"}
                    message={t('delete_machinery_confirm') || "Are you sure you want to delete this machinery? This action cannot be undone."}
                    confirmText={t('delete') || "Delete"}
                    isDanger={true}
                />
            </div>
        </DashboardShell>
    );
};

export default OwnerDashboard;
