import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.authProfile();
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    localStorage.removeItem('userToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.authLogin({ email, password });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    // Registrasi 2 langkah: backend TIDAK mengembalikan token di sini, hanya
    // mengirim OTP ke email. Jangan setToken/setUser — belum ada sesi.
    // Caller wajib mengarahkan user ke /auth/verify lalu memanggil verifyRegistration.
    const register = async (data) => {
        const response = await api.authRegister(data);
        return {
            requiresVerification: true,
            email: response.data.email,
            maskedEmail: response.data.masked_email,
            resendAvailableIn: response.data.resend_available_in,
        };
    };

    // Langkah 2: tukar OTP dengan sesi yang sebenarnya.
    const verifyRegistration = async (email, code) => {
        const response = await api.authVerifyRegistration({ email, code });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
    };

    const refreshProfile = async () => {
        try {
            const response = await api.authProfile();
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, verifyRegistration, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
