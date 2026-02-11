import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import { Users, Shield, Plus, Trash2, Power, AlertCircle, RefreshCw, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SuperAdminDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [subAdmins, setSubAdmins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'FARMER_SUBADMIN'
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
            const [statsRes, subAdminsRes] = await Promise.all([
                api.get('/superadmin/stats').catch(e => {
                    console.error("Stats fetch failed:", e);
                    return { data: null };
                }),
                api.get('/superadmin/all-subadmins').catch(e => {
                    console.error("SubAdmins fetch failed:", e);
                    return { data: [] };
                })
            ]);

            setStats(statsRes.data);
            setSubAdmins(subAdminsRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError('Failed to fetch data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validation
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
            await api.post(`/superadmin/subadmin/create?role=${formData.role}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });

            setFormSuccess(t('sub_admin_created_success'));
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'FARMER_SUBADMIN' });
            setTimeout(() => {
                setIsCreateModalOpen(false);
                fetchData();
            }, 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || t('sub_admin_create_fail'));
        }
    };

    const handleDisableSubAdmin = async (id) => {
        try {
            await api.put(`/superadmin/subadmin/${id}/disable`);
            setError('');
            fetchData();
        } catch (err) {
            setError('Failed to disable sub-admin.');
        }
    };

    const handleEnableSubAdmin = async (id) => {
        try {
            await api.put(`/superadmin/subadmin/${id}/enable`);
            setError('');
            fetchData();
        } catch (err) {
            setError('Failed to enable sub-admin.');
        }
    };



    const getFilteredSubAdmins = () => {
        if (activeTab === 'all') return subAdmins;
        return subAdmins.filter(sa => sa.role === activeTab || sa.role === `ROLE_${activeTab}`);
    };

    const getRoleColor = (role) => {
        // Normalize role to exclude ROLE_ prefix for lookup
        const normalizedRole = role.replace('ROLE_', '');
        const colors = {
            'FARMER_SUBADMIN': 'bg-emerald-100 text-emerald-700',
            'MACHINERY_OWNER_SUBADMIN': 'bg-blue-100 text-blue-700',
            'WORKER_SUBADMIN': 'bg-amber-100 text-amber-700'
        };
        return colors[normalizedRole] || 'bg-slate-100 text-slate-700';
    };

    const getRoleLabel = (role) => {
        return role.replace('_SUBADMIN', '').replace(/_/g, ' ');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
    );

    const filteredSubAdmins = getFilteredSubAdmins();

    return (
        <DashboardShell title={t('super_admin_control_panel')}>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{t('system_overview')}</h2>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        {t('create_sub_admin')}
                    </button>
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

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label={t('total_sub_admins')}
                    value={stats?.totalSubAdmins || 0}
                    icon={Users}
                    color="bg-slate-500"
                />
                <StatCard
                    label={t('farmer_sub_admins')}
                    value={stats?.farmerSubAdmins || 0}
                    icon={Users}
                    color="bg-emerald-500"
                />
                <StatCard
                    label={t('machinery_sub_admins')}
                    value={stats?.machineryOwnerSubAdmins || 0}
                    icon={Shield}
                    color="bg-blue-500"
                />
                <StatCard
                    label={t('worker_sub_admins')}
                    value={stats?.workerSubAdmins || 0}
                    icon={Users}
                    color="bg-amber-500"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8 overflow-auto">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('all')} ({subAdmins.length})
                </button>
                <button
                    onClick={() => setActiveTab('FARMER_SUBADMIN')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'FARMER_SUBADMIN' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('farmer')}
                </button>
                <button
                    onClick={() => setActiveTab('MACHINERY_OWNER_SUBADMIN')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'MACHINERY_OWNER_SUBADMIN' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('machinery')}
                </button>
                <button
                    onClick={() => setActiveTab('WORKER_SUBADMIN')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'WORKER_SUBADMIN' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {t('worker')}
                </button>
            </div>

            {/* Sub-Admins Table */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tighter">
                        {activeTab === 'all' ? t('all_sub_admins') : getRoleLabel(activeTab) + ' Sub-Admins'}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">{t('profile')}</th>
                                <th className="px-8 py-5">{t('role')}</th>
                                <th className="px-8 py-5">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSubAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Shield size={48} className="text-slate-300" />
                                            <p className="text-slate-500 font-medium">{t('no_sub_admins')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubAdmins.map(subAdmin => (
                                    <tr key={subAdmin.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                    {subAdmin.firstName?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 uppercase italic tracking-tight">
                                                        {subAdmin.firstName} {subAdmin.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-bold tracking-widest">{subAdmin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${getRoleColor(subAdmin.role)}`}>
                                                {getRoleLabel(subAdmin.role)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${subAdmin.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${subAdmin.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {subAdmin.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Create Sub-Admin Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 uppercase italic">{t('create_sub_admin')}</h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setFormError('');
                                    setFormSuccess('');
                                    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'FARMER_SUBADMIN' });
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubAdmin} className="p-8 space-y-6">
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
                                        placeholder={t('first_name')}
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
                                        placeholder="Enter Last Name"
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
                                    placeholder="name@example.com"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('role')}</label>
                                <div className="relative">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-600 font-medium appearance-none bg-white"
                                    >
                                        <option value="FARMER_SUBADMIN">{t('farmer_subadmin')}</option>
                                        <option value="MACHINERY_OWNER_SUBADMIN">{t('machinery_owner_subadmin')}</option>
                                        <option value="WORKER_SUBADMIN">{t('worker_subadmin')}</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
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
                                {t('create_sub_admin')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}

        </DashboardShell>
    );
};

export default SuperAdminDashboard;
