import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collectionGroup, query, where, onSnapshot, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../auth/AuthContext';

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [unseenCount, setUnseenCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    const [userCache, setUserCache] = useState({});

    // Helper to add toast
    const addToast = useCallback((toast) => {
        setToasts((prev) => [...prev, toast]);
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const markNotificationAsRead = async (chatId) => {
        try {
            const { collection, getDocs } = await import('firebase/firestore');
            const msgsRef = collection(db, 'conversations', chatId, 'messages');
            const q = query(msgsRef, where('seen', '==', false));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.docs.forEach(doc => {
                batch.update(doc.ref, { seen: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking chat as read:", error);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnseenCount(0);
            return;
        }

        const q = query(
            collectionGroup(db, 'messages'),
            where('seen', '==', false)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            let count = 0;
            const rawNotifications = [];
            const batch = writeBatch(db);
            let batchHasUpdates = false;

            snapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.senderId === user.uid) return;

                const pathSegments = docSnap.ref.path.split('/');
                const chatId = pathSegments[1];

                if (chatId === activeChatId) {
                    batch.update(docSnap.ref, { seen: true });
                    batchHasUpdates = true;
                } else {
                    count++;
                    rawNotifications.push({
                        id: docSnap.id,
                        chatId,
                        ...data,
                        timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
                    });
                }
            });

            if (batchHasUpdates) {
                batch.commit().catch(err => console.error("Error marking seen in active chat:", err));
            }

            rawNotifications.sort((a, b) => b.timestamp - a.timestamp);

            // Enrich notifications with sender data
            const enrichedNotifications = await Promise.all(rawNotifications.map(async (notif) => {
                // Check cache first
                let senderData = userCache[notif.senderId];
                if (!senderData) {
                    try {
                        const { getDoc, doc } = await import('firebase/firestore');
                        const userDoc = await getDoc(doc(db, 'users', notif.senderId));
                        if (userDoc.exists()) {
                            senderData = userDoc.data();
                            // Update cache - simplistic approach
                            setUserCache(prev => ({ ...prev, [notif.senderId]: senderData }));
                        }
                    } catch (e) {
                        console.error("Error fetching user for notif:", e);
                    }
                }

                return {
                    ...notif,
                    senderName: senderData?.displayName || senderData?.username || senderData?.email || 'User',
                    senderAvatar: senderData?.photoURL
                };
            }));

            setUnseenCount(count);
            setNotifications(enrichedNotifications);

            // 2. Handle New Messages for Toasts
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    if (data.senderId === user.uid) return;

                    const pathSegments = change.doc.ref.path.split('/');
                    const chatId = pathSegments[1];

                    if (chatId !== activeChatId) {
                        try {
                            const { getDoc, doc } = await import('firebase/firestore');
                            const senderSnap = await getDoc(doc(db, 'users', data.senderId));
                            const senderData = senderSnap.exists() ? senderSnap.data() : {};

                            addToast({
                                id: change.doc.id,
                                chatId,
                                senderName: senderData.displayName || senderData.email || 'Someone',
                                ...data
                            });
                        } catch (err) {
                            console.error("Error fetching sender for toast:", err);
                        }
                    }
                }
            });

        }, (error) => {
            console.error("Notification subscription error:", error);
        });

        return () => unsubscribe();
    }, [user, activeChatId, addToast]);

    const value = {
        unseenCount,
        notifications,
        toasts,
        removeToast,
        markNotificationAsRead,
        setActiveChatId,
        activeChatId
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
