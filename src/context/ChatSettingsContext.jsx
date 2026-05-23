import { createContext, useContext } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useChatSettings } from '../hooks/useChatSettings';

const ChatSettingsContext = createContext(null);

export function ChatSettingsProvider({ children }) {
    const { user } = useAuth();
    const { settings, loading, updateSetting } = useChatSettings(user?.uid);

    return (
        <ChatSettingsContext.Provider value={{ settings, loading, updateSetting }}>
            {children}
        </ChatSettingsContext.Provider>
    );
}

export function useChatSettingsContext() {
    const ctx = useContext(ChatSettingsContext);
    if (!ctx) throw new Error('useChatSettingsContext must be used within ChatSettingsProvider');
    return ctx;
}
