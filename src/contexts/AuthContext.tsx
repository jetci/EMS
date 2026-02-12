import React, { createContext, useContext } from 'react';
import { User } from '../../types';

export interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    isLoading?: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Fallback for when context is not available
        return { user: null, login: async () => false, logout: () => { } };
    }
    return context;
};
