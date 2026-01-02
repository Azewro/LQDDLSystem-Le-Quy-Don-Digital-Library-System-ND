import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    showLogin: boolean;
    setShowLogin: (show: boolean) => void;
    showProfile: boolean;
    setShowProfile: (show: boolean) => void;
    mustChangePassword: boolean;
    setMustChangePassword: (must: boolean) => void;
    handleLoginSuccess: (userData: User, mustChange?: boolean) => void;
    handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('lqddl_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [showLogin, setShowLogin] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [mustChangePassword, setMustChangePassword] = useState(false);

    // Save user to localStorage whenever it changes
    React.useEffect(() => {
        if (user) {
            localStorage.setItem('lqddl_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('lqddl_user');
        }
    }, [user]);

    const handleLoginSuccess = (userData: User, mustChange: boolean = false) => {
        setUser(userData);
        if (mustChange) {
            setMustChangePassword(true);
            setShowProfile(true);
        } else {
            setShowLogin(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('lqddl_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            showLogin,
            setShowLogin,
            showProfile,
            setShowProfile,
            mustChangePassword,
            setMustChangePassword,
            handleLoginSuccess,
            handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
