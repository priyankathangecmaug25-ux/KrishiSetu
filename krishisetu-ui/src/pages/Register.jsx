import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, ArrowRight, User, Mail, Phone, Lock, ChevronDown, CheckCircle } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'Farmer'
    });
    const [success, setSuccess] = useState(false);
    const [needsOtp, setNeedsOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const { register, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation - Check all fields
        if (!formData.firstName || formData.firstName.trim() === '') {
            setError('First name is required');
            return;
        }

        if (!formData.lastName || formData.lastName.trim() === '') {
            setError('Last name is required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || formData.email.trim() === '') {
            setError('Email address is required');
            return;
        }
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address with @ symbol');
            return;
        }

        // Phone validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
            setError('Phone number is required');
            return;
        }
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError('Phone number must be 10 digits starting with 6-9');
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!formData.password || formData.password.trim() === '') {
            setError('Password is required');
            return;
        }
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be 8+ characters with letters, numbers, and special characters');
            return;
        }

        try {
            await register(formData);
            setNeedsOtp(true);
        } catch (err) {
            setError(err.response?.data?.message || t('create_account_fail'));
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await verifyOtp(formData.email, otp);
            setSuccess(true);
            setNeedsOtp(false);
        } catch (err) {
            setError(err.response?.data?.message || t('invalid_otp'));
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-inter">
            {/* Form Side */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
                <LanguageToggle className="absolute top-6 right-6" />
                <div className="w-full max-w-xl py-4">
                    <div className="mb-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2 hover:translate-x-[-4px] transition-transform duration-300 italic">
                            ◀ {t('back_to_home')}
                        </Link>
                        <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tighter uppercase italic leading-none mb-1">{t('create_profile')}</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{t('join_network')}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl mb-10 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] text-center">
                            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-black font-outfit text-slate-900 mb-4 italic uppercase tracking-tighter">{t('verification_successful')}</h2>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {t('verification_desc').split('.')[0]}. {t('verification_desc').split('.')[1]} <span className="text-primary-600 font-bold italic">{t('pending_admin_approval')}</span>.
                                {t('verification_desc').split('.')[3]}
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">
                                {t('go_to_home')} <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : needsOtp ? (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-slate-500 font-medium">{t('otp_sent')} <span className="text-slate-900 font-bold">{formData.email}</span></p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-center block">{t('enter_otp')}</label>
                                <input
                                    type="text" required
                                    maxLength="6"
                                    className="input-field h-14 text-center text-xl font-black tracking-[1rem]"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                />
                            </div>
                            <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6">
                                {t('verify_create')} <ArrowRight size={18} />
                            </button>
                            <button type="button" onClick={() => setNeedsOtp(false)} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                                {t('back_to_register')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('first_name')}</label>
                                    <input
                                        type="text"
                                        className="input-field h-11 py-2"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder={t('enter_first_name')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('last_name')}</label>
                                    <input
                                        type="text"
                                        className="input-field h-11"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder={t('enter_last_name')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('email_address')}</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            className="input-field pl-10 h-11"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="example@email.com"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('phone_number')}</label>
                                    <div className="relative group">
                                        <input
                                            type="tel" required
                                            className="input-field pl-10 h-11 py-2"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="+91"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('what_is_role')}</label>
                                <div className="relative group">
                                    <select
                                        className="input-field h-11 appearance-none pr-10 py-2"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Farmer">{t('i_am_farmer')}</option>
                                        <option value="MachineryOwner">{t('i_own_machinery')}</option>
                                        <option value="FarmWorker">{t('i_am_worker')}</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-primary-600 transition-colors" size={20} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('choose_password')}</label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        className="input-field pl-10 h-11 py-2"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                </div>
                            </div>

                            <button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6">
                                {t('create_account')} <ArrowRight size={18} />
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {t('already_have_account')} <Link to="/login" className="text-primary-600 font-bold hover:underline italic">{t('log_in_now')}</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Side */}
            <div className="hidden xl:flex xl:w-[45%] bg-slate-50 relative p-24 items-end overflow-hidden">
                <div className="absolute inset-0 opacity-40 pointer-events-none auth-bg-pattern"></div>

                <div className="relative z-10 max-w-sm">
                    <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 mb-10 translate-x-12 relative group hover:translate-x-8 transition-transform duration-700">
                        <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
                            <CheckCircle size={32} />
                        </div>
                        <h4 className="text-2xl font-black font-outfit text-slate-900 mb-2 italic uppercase tracking-tighter leading-none">{t('safe_network')}</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{t('safe_verified_desc')}</p>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 text-white relative z-20 hover:-translate-y-4 transition-transform duration-700">
                        <Tractor className="text-primary-500 mb-6" size={48} />
                        <h4 className="text-2xl font-black font-outfit mb-2 italic uppercase tracking-tighter leading-none">{t('smart_farming').split('.')[0]}.</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed italic">{t('smart_farming_desc')}</p>
                    </div>
                </div>

                <div className="absolute top-1/2 right-[-20%] transform -translate-y-1/2 grayscale opacity-5 rotate-45 pointer-events-none">
                    <Tractor size={800} />
                </div>
            </div>
        </div>
    );
};

export default Register;
