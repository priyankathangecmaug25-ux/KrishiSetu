import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import BookingModal from '../components/BookingModal';
import PaymentModal from '../components/PaymentModal';
import { Tractor, Users, Calendar, MapPin, MoreHorizontal, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';
import defaultMachineryImage from '../assets/machinery_demo.png';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [machinery, setMachinery] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
    const [activeTab, setActiveTab] = useState('browse');

    const location = useLocation();

    useEffect(() => {
        const hash = location.hash;
        if (hash === '#bookings') setActiveTab('bookings');
        else if (hash === '#workforce') setActiveTab('workforce');
        else setActiveTab('browse');
    }, [location.hash]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [macRes, bookRes, workRes] = await Promise.all([
                api.get(`/farmer/machinery/search`),
                api.get('/farmer/bookings/history'),
                api.get(`/farmer/workers/search`)
            ]);
            setMachinery(macRes.data);
            setBookings(bookRes.data);
            setWorkers(workRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const handleBookingSuccess = () => {
        setSelectedItem(null);
        fetchData();
        setActiveTab('bookings');
    };

    const handlePay = (booking) => {
        setSelectedPaymentBooking(booking);
    };

    const handleConfirmPayment = async () => {
        try {
            const response = await api.post(`/farmer/bookings/${selectedPaymentBooking.id}/pay`);
            const { orderId, amount, currency, keyId } = response.data;

            const options = {
                key: keyId,
                amount: amount * 100,
                currency: currency,
                name: "KrishiSetu",
                description: "Booking Payment",
                order_id: orderId,
                handler: async function (response) {
                    await api.post('/farmer/bookings/verify', {
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature
                    });
                    setSelectedPaymentBooking(null);
                    fetchData();
                },
                prefill: {
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    contact: "9999999999"
                },
                theme: {
                    color: "#059669",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(t('payment_init_fail'));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
    );

    return (
        <DashboardShell title={activeTab === 'browse' ? t('browse_machinery') : t('my_bookings')}>

            {/* Tabs Selector */}
            <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-10 overflow-hidden">
                <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} label={t('market')} icon={<ShoppingBag size={18} />} />
                <TabButton active={activeTab === 'workforce'} onClick={() => setActiveTab('workforce')} label={t('workforce')} icon={<Users size={18} />} />
                <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label={t('my_bookings')} icon={<Calendar size={18} />} />
            </div>

            {activeTab === 'browse' ? (
                <div className="space-y-8">

                    {/* Machinery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {machinery.map(item => (
                            <div key={item.id} className="group bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="h-56 relative overflow-hidden">
                                    <img
                                        src={item.imageUrl || defaultMachineryImage}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-primary-700 uppercase tracking-widest leading-none shadow-sm">
                                            {item.category?.name || t('machinery')}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight italic uppercase">{item.name}</h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-8">
                                            {item.description || 'High-quality machinery for your farm. Well-maintained and ready to use.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('rental_price')}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-primary-600 tracking-tighter">₹{item.ratePerDay}</span>
                                                <span className="text-xs font-bold text-slate-400 italic">{t('per_day')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-600/20 transition-all active:scale-95"
                                        >
                                            {t('book_now')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : activeTab === 'workforce' ? (
                <div className="space-y-8">

                    {/* Workers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {workers.map(worker => (
                            <div key={worker.id} className="group bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-900/20 group-hover:bg-primary-600 transition-colors">
                                            {worker.workerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{worker.workerName}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t('experienced_worker')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('skills')}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {worker.skills.split(',').map((skill, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('bio')}</p>
                                            <p className="text-slate-500 text-xs font-medium line-clamp-3 leading-relaxed">
                                                {worker.bio || 'I am a dedicated farm worker with extensive experience in various agricultural tasks.'}
                                            </p>
                                        </div>
                                        {worker.availableDate && (
                                            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-emerald-600" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.1em] leading-none mb-1">{t('available_from')}</p>
                                                        <p className="text-sm font-black text-emerald-600 tracking-tighter">
                                                            {new Date(worker.availableDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('service_fee')}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-primary-600 tracking-tighter">₹{worker.hourlyRate}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t('per_hour')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedItem(worker)}
                                            className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95"
                                        >
                                            {t('hire_now')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard label={t('confirmed')} value={bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length} icon={Tractor} color="bg-emerald-500" />
                        <StatCard label={t('pending_payment')} value={bookings.filter(b => b.paymentStatus === 'PENDING').length} icon={Calendar} color="bg-amber-500" />
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{t('booking_history')}</h3>
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreHorizontal /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5">{t('item_worker')}</th>
                                        <th className="px-8 py-5">{t('dates')}</th>
                                        <th className="px-8 py-5">{t('amount')}</th>
                                        <th className="px-8 py-5">{t('status')}</th>
                                        <th className="px-8 py-5 text-center">{t('payment')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bookings.map(book => (
                                        <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                        {book.machinery ? <Tractor size={20} /> : <Users size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg tracking-tighter leading-none mb-1 uppercase">
                                                            {book.machinery?.name || (book.workerProfile?.worker?.firstName + ' ' + book.workerProfile?.worker?.lastName)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest italic">
                                                            {book.machinery ? (book.machinery.category?.name || t('machinery')) : t('worker')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 inline-block font-bold text-xs text-slate-600">
                                                    {new Date(book.startDate).toLocaleDateString()}
                                                    {book.endDate && new Date(book.startDate).getTime() !== new Date(book.endDate).getTime() &&
                                                        ` - ${new Date(book.endDate).toLocaleDateString()}`
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-lg font-black text-slate-900 tracking-tighter">₹{book.amount}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`
                                                    flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${book.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                                                        book.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                            book.status === 'CONFIRMED' || book.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-700'}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'PENDING_APPROVAL' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                                    {book.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 flex justify-center">
                                                {book.status === 'APPROVED' && book.paymentStatus === 'PENDING' ? (
                                                    <button
                                                        onClick={() => handlePay(book)}
                                                        className="bg-primary-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
                                                    >
                                                        {t('pay_now')}
                                                    </button>
                                                ) : book.paymentStatus === 'PAID' ? (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest italic">
                                                        <ShieldCheck size={18} /> {t('paid')}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                        {book.status === 'REJECTED' ? t('rejected') : t('waiting_for_approval')}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && (
                <BookingModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSuccess={handleBookingSuccess}
                />
            )}

            {selectedPaymentBooking && (
                <PaymentModal
                    booking={selectedPaymentBooking}
                    onClose={() => setSelectedPaymentBooking(null)}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </DashboardShell>
    );
};

const TabButton = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300
            ${active ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}
        `}
    >
        {icon}
        {label}
    </button>
);

export default FarmerDashboard;
