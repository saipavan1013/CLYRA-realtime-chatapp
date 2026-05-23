import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const DEFAULTS = {
    enterIsSend: true,
    mediaVisibility: true,
    keepChatsArchived: false,
    wallpaper: null,
    autoDeleteDays: null,
};

/**
 * useChatSettings — manages per-user chat settings in Firestore.
 * Listens in real-time so changes sync across tabs/devices.
 */
export function useChatSettings(uid) {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }

        const ref = doc(db, 'user_settings', uid);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setSettings({ ...DEFAULTS, ...snap.data() });
            }
            setLoading(false);
        });

        return unsub;
    }, [uid]);

    const updateSetting = useCallback(async (key, value) => {
        if (!uid) return;
        const ref = doc(db, 'user_settings', uid);
        await setDoc(ref, { [key]: value }, { merge: true });
        // onSnapshot will update state automatically
    }, [uid]);

    return { settings, loading, updateSetting };
}
