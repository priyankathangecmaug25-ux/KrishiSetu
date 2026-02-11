import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import { Tractor, Users, Clock, AlertCircle, RefreshCw, Plus, Check, X, Power, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MachinerySubAdminDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [pendingOwners, setPendingOwners] = useState([]);
    const [approvedOwners, setApprovedOwners] = useState([]);
    const [pendingListings, setPendingListings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('owners-pending');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, pendingOwnersRes, approvedOwnersRes, pendingListingsRes] = await Promise.all([
                api.get('/subadmin/machinery/stats').catch(e => ({ data: null })),
                api.get('/subadmin/machinery/pending-owners').catch(e => ({ data: [] })),
                api.get('/subadmin/machinery/approved-owners').catch(e => ({ data: [] })),
                api.get('/subadmin/machinery/pending-listings').catch(e => ({ data: [] }))
            ]);

            setStats(statsRes.data);
            setPendingOwners(pendingOwnersRes.data || []);
            setApprovedOwners(approvedOwnersRes.data || []);
            setPendingListings(pendingListingsRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOwner = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setFormError('First and last names are required.');
            return;
        }
        if (!formData.email.includes('@')) {
            setFormError('Please enter a valid email address.');
            return;
        }
        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters.');
            return;
        }

        try {
            await api.post('/subadmin/machinery/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });

            setFormSuccess(t('machinery_owner_registered_success'));
            setFormData({ firstName: '', lastName: '', email: '', password: '' });
            setTimeout(() => {
                setIsCreateModalOpen(false);
                fetchData();
            }, 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || t('register_owner_fail'));
        }
    };

    const handleApproveOwner = async (ownerId) => {
        try {
            await api.put(`/subadmin/machinery/${ownerId}/approve-owner`);
            fetchData();
        } catch (err) {
            setError('Failed to approve owner.');
        }
    };

    const handleRejectOwner = async (ownerId) => {
        try {
            await api.put(`/subadmin/machinery/${ownerId}/reject-owner`);
            fetchData();
        } catch (err) {
            setError('Failed to reject owner.');
        }
    };

    const handleApproveListing = async (listingId) => {
        try {
            await api.put(`/subadmin/machinery/${listingId}/approve-listing`);
            fetchData();
        } catch (err) {
            setError('Failed to approve machinery listing.');
        }
    };

    const handleRejectListing = async (listingId) => {
        try {
            await api.put(`/subadmin/machinery/${listingId}/reject-listing`);
            fetchData();
        } catch (err) {
            setError('Failed to reject machinery listing.');
        }
    };

    const handleDisableOwner = async (ownerId) => {
        try {
            await api.put(`/subadmin/machinery/${ownerId}/disable`);
            fetchData();
        } catch (err) {
            setError('Failed to disable owner.');
        }
    };

    const handleEnableOwner = async (ownerId) => {
        try {
            await api.put(`/subadmin/machinery/${ownerId}/enable`);
            fetchData();
        } catch (err) {
            setError('Failed to enable owner.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
    );

    return (
        <DashboardShell title={t('machinery_management')}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{t('owner_machinery_approval')}</h2>
                </div>
                <div className="flex gap-4">

                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-600 hover:shadow-lg transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    label={t('pending_owner_registrations')}
                    value={stats?.pendingOwnerRegistrations || 0}
                    icon={Clock}
                    color="bg-amber-500"
                />
                <StatCard
                    label={t('approved_machinery_owners')}
                    value={stats?.approvedOwners || 0}
                    icon={Users}
                    color="bg-emerald-500"
                />
                <StatCard
                    label={t('pending_machinery_listings')}
                    value={stats?.pendingMachineryListings || 0}
                    icon={Clock}
                    color="bg-blue-500"
                />

            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8 overflow-auto">
                <button
                    onClick={() => setActiveTab('owners-pending')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'owners-pending' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('pending_owner_registrations')}
                </button>
                <button
                    onClick={() => setActiveTab('owners-approved')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'owners-approved' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('approved_machinery_owners')}
                </button>
                <button
                    onClick={() => setActiveTab('listings-pending')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'listings-pending' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('pending_machinery_listings')}
                </button>
            </div>

            {/* Pending Owners Table */}
            {activeTab === 'owners-pending' && (
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-xl font-bold text-slate-900 uppercase italic">{t('pending_owner_approvals')}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">{t('profile')}</th>
                                    <th className="px-8 py-5">{t('email_address')}</th>
                                    <th className="px-8 py-5">{t('applied')}</th>
                                    <th className="px-8 py-5">{t('action')}</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingOwners.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users size={48} className="text-slate-300" />
                                                <p className="text-slate-500 font-medium">{t('no_pending_owner_approvals')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingOwners.map(owner => (
                                        <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600">
                                                        {owner.firstName?.charAt(0).toUpperCase() || 'O'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 uppercase italic tracking-tight">
                                                            {owner.firstName} {owner.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-bold">{owner.email}</td>
                                            <td className="px-8 py-6 text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveOwner(owner.id)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        title={t('approve')}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowConfirm(owner.id);
                                                            setConfirmAction('reject-owner');
                                                        }}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title={t('reject')}
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Approved Owners Table */}
            {activeTab === 'owners-approved' && (
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-xl font-bold text-slate-900 uppercase italic">{t('approved_machinery_owners')}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">{t('profile')}</th>
                                    <th className="px-8 py-5">{t('email_address')}</th>
                                    <th className="px-8 py-5">{t('status')}</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {approvedOwners.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users size={48} className="text-slate-300" />
                                                <p className="text-slate-500 font-medium">{t('no_approved_owners')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    approvedOwners.map(owner => (
                                        <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-600">
                                                        {owner.firstName?.charAt(0).toUpperCase() || 'O'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 uppercase italic tracking-tight">
                                                            {owner.firstName} {owner.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-bold">{owner.email}</td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${owner.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${owner.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {owner.enabled ? t('active') : t('disabled')}
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Pending Machinery Listings Table */}
            {activeTab === 'listings-pending' && (
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-xl font-bold text-slate-900 uppercase italic">{t('pending_machinery_listings')}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">{t('equipment')}</th>
                                    <th className="px-8 py-5">{t('owner')}</th>
                                    <th className="px-8 py-5">{t('rate')}</th>
                                    <th className="px-8 py-5">{t('applied')}</th>
                                    <th className="px-8 py-5">{t('action')}</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingListings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <ShoppingBag size={48} className="text-slate-300" />
                                                <p className="text-slate-500 font-medium">{t('no_pending_machinery_listings')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingListings.map(listing => (
                                        <tr key={listing.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <Tractor size={18} className="text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 uppercase italic tracking-tight text-sm">{listing.name || 'Machinery'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-600 font-bold">{listing.ownerName || 'N/A'}</td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-900">₹{listing.ratePerDay || 0}/Day</td>
                                            <td className="px-8 py-6 text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveListing(listing.id)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                        title={t('approve')}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowConfirm(listing.id);
                                                            setConfirmAction('reject-listing');
                                                        }}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title={t('reject')}
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Create Owner Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 uppercase italic">{t('register_machinery_owner')}</h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setFormError('');
                                    setFormSuccess('');
                                    setFormData({ firstName: '', lastName: '', email: '', password: '' });
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOwner} className="p-8 space-y-6">
                            {formError && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Check size={16} />
                                    {formSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('first_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Suresh"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('last_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Singh"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('email_address')}</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="owner@example.com"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('password')}</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">{t('min_chars')}</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-95"
                            >
                                {t('register_owner')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {confirmAction === 'reject-owner' ? t('reject_owner_confirm') : t('reject_listing_confirm')}
                        </h3>
                        <p className="text-slate-500 text-sm mb-8">
                            {confirmAction === 'reject-owner'
                                ? t('machinery_owner_reapply')
                                : t('machinery_listing_reject_desc')}
                            {t('action_cannot_undo')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmAction === 'reject-owner') {
                                        handleRejectOwner(showConfirm);
                                    } else {
                                        handleRejectListing(showConfirm);
                                    }
                                    setShowConfirm(null);
                                }}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
                            >
                                {t('reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
};

export default MachinerySubAdminDashboard;
