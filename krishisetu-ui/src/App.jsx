import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import FarmerSubAdminDashboard from './pages/FarmerSubAdminDashboard';
import MachinerySubAdminDashboard from './pages/MachinerySubAdminDashboard';
import WorkerSubAdminDashboard from './pages/WorkerSubAdminDashboard';
import UserProfile from './pages/UserProfile';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    // Map human-readable roles from props to backend ROLE names
    const roleMap = {
        'Admin': 'ROLE_ADMIN',
        'SuperAdmin': 'ROLE_SUPER_ADMIN',
        'FarmerSubAdmin': 'ROLE_FARMER_SUBADMIN',
        'MachineryOwnerSubAdmin': 'ROLE_MACHINERY_OWNER_SUBADMIN',
        'WorkerSubAdmin': 'ROLE_WORKER_SUBADMIN',
        'Farmer': 'ROLE_FARMER',
        'MachineryOwner': 'ROLE_OWNER',
        'FarmWorker': 'ROLE_WORKER'
    };

    const requiredRole = roleMap[role] || 'ROLE_USER';

    if (role && !user.roles?.includes(requiredRole)) {
        return <Navigate to="/" />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Regular User Dashboards */}
                    <Route path="/farmer" element={<ProtectedRoute role="Farmer"><FarmerDashboard /></ProtectedRoute>} />
                    <Route path="/owner" element={<ProtectedRoute role="MachineryOwner"><OwnerDashboard /></ProtectedRoute>} />
                    <Route path="/worker" element={<ProtectedRoute role="FarmWorker"><WorkerDashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

                    {/* Admin Dashboards */}
                    <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />

                    {/* Sub-Admin Dashboards */}
                    <Route path="/superadmin" element={<ProtectedRoute role="SuperAdmin"><SuperAdminDashboard /></ProtectedRoute>} />
                    <Route path="/farmer-subadmin" element={<ProtectedRoute role="FarmerSubAdmin"><FarmerSubAdminDashboard /></ProtectedRoute>} />
                    <Route path="/machinery-subadmin" element={<ProtectedRoute role="MachineryOwnerSubAdmin"><MachinerySubAdminDashboard /></ProtectedRoute>} />
                    <Route path="/worker-subadmin" element={<ProtectedRoute role="WorkerSubAdmin"><WorkerSubAdminDashboard /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>

            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider >
    );
}

export default App;
