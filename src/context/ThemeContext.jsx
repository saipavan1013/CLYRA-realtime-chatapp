import { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // Apply theme to DOM immediately
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // Persist theme to Firestore for a given uid
    const persistTheme = async (uid, newTheme) => {
        if (!uid) return;
        try {
            await setDoc(doc(db, 'user_settings', uid), { theme: newTheme }, { merge: true });
        } catch (e) {
            console.warn('Could not persist theme to Firestore:', e);
        }
    };

    // Load theme from Firestore on login
    const loadThemeForUser = async (uid) => {
        if (!uid) return;
        try {
            const snap = await getDoc(doc(db, 'user_settings', uid));
            if (snap.exists() && snap.data().theme) {
                setThemeState(snap.data().theme);
            }
        } catch (e) {
            console.warn('Could not load theme from Firestore:', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, persistTheme, loadThemeForUser }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
