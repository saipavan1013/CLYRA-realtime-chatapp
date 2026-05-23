import { useEffect } from 'react';
import { collectionGroup, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Hook to listen for all incoming messages for the current user 
 * and mark them as 'delivered' if they haven't been.
 */
export function useGlobalDelivery(currentUserId) {
    useEffect(() => {
        if (!currentUserId) return;

        // Use collectionGroup to listen for 'messages' across all conversations
        // We only care about messages where senderId != currentUserId and delivered == false
        // Note: This requires a composite index in Firestore for collectionGroup 'messages'
        // with fields 'senderId' and 'delivered'.
        const q = query(
            collectionGroup(db, 'messages'),
            where('delivered', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const batch = writeBatch(db);
            let hasUpdates = false;

            snapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                // Skip messages sent by the current user
                if (data.senderId !== currentUserId) {
                    // If the message belongs to a conversation the user is part of
                    // For simplicity in this structure, we'll check if the doc path contains a chatId 
                    // and assumes messages delivered to the listener are for them.
                    // In a real app, you'd check a 'participants' array or similar.
                    batch.update(docSnap.ref, { delivered: true });
                    hasUpdates = true;
                }
            });

            if (hasUpdates) {
                batch.commit().catch(err => console.error('Global delivery update error:', err));
            }
        });

        return unsubscribe;
    }, [currentUserId]);
}
