import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Backend signin endpoint is /api/auth/signin and returns { token, id, email, roles }
        const response = await api.post('/auth/signin', { email, password });
        const { token, id, email: respEmail, firstName, lastName, roles: backendRoles } = response.data;

        if (token) {
            localStorage.setItem('token', token);

            // Map backend role names to frontend ROLE_* constants expected by the UI
            const roleMap = {
                'SUPERADMIN': 'ROLE_SUPER_ADMIN',
                'FARMER_SUBADMIN': 'ROLE_FARMER_SUBADMIN',
                'MACHINERY_OWNER_SUBADMIN': 'ROLE_MACHINERY_OWNER_SUBADMIN',
                'WORKER_SUBADMIN': 'ROLE_WORKER_SUBADMIN',
                'FARMER': 'ROLE_FARMER',
                'MACHINERY_OWNER': 'ROLE_OWNER',
                'WORKER': 'ROLE_WORKER',
                'ADMIN': 'ROLE_ADMIN'
            };

            const roles = Array.isArray(backendRoles)
                ? backendRoles.map(r => roleMap[r] || r)
                : [(roleMap[backendRoles] || backendRoles || 'ROLE_USER')];

            const userData = { id, email: respEmail, firstName, lastName, roles };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        }

        return response.data;
    };

    const register = async (userData) => {
        // Map frontend roles to backend roles
        // Backend expects: "Farmer", "MachineryOwner", "FarmWorker", "Admin"
        // Frontend sends: "Farmer", "MachineryOwner", "FarmWorker"
        // No mapping needed if we ensure frontend sends exactly what backend expects in Role name lookup
        // However, backend Role table has specific names. Let's check AuthService.cs:
        // var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == registerDto.Role);
        // We need to ensure frontend sends valid Role Names.

        const signupData = {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            role: userData.role // "Farmer", "MachineryOwner", "FarmWorker"
        };

        const response = await api.post('/auth/signup', signupData);
        return response.data;
    };

    const verifyOtp = async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
