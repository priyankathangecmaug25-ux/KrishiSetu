import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';

const UserProfile = () => {
    const { user } = useAuth();

    return (
        <DashboardShell title="My Profile & Roles">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* User Info Card */}
                <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-black">
                        {user?.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{user?.email}</p>
                        <div className="flex gap-2">
                            {user?.roles?.map(role => (
                                <span key={role} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl text-xs font-black uppercase tracking-widest">
                                    {role.replace('ROLE_', '')}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>


            </div>
        </DashboardShell>
    );
};

export default UserProfile;
