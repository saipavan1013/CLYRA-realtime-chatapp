import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Hook to fetch conversations the current user is participating in.
 * Orders by lastMessageTimestamp descending.
 */
export function useConversations(currentUserId) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const conversationsRef = collection(db, 'conversations');
        const q = query(
            conversationsRef,
            where('participants', 'array-contains', currentUserId),
            orderBy('lastMessageTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const convList = await Promise.all(
                    snapshot.docs.map(async (docSnap) => {
                        const data = docSnap.data();
                        const otherUserId = data.participants.find((id) => id !== currentUserId);

                        // Fetch other user details for display
                        let otherUserInfo = { displayName: 'User', email: '...', isOnline: false };
                        if (otherUserId) {
                            const userRef = doc(db, 'users', otherUserId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                otherUserInfo = userSnap.data();
                            }
                        }

                        return {
                            id: docSnap.id,
                            ...data,
                            otherUser: otherUserInfo,
                            name: otherUserInfo.displayName || otherUserInfo.email,
                            participantId: otherUserId, // for presence logic compatibility
                        };
                    })
                );

                setConversations(convList);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching conversations:', error);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [currentUserId]);

    return { conversations, loading };
}
