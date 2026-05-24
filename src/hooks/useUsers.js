import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Hook to fetch all users from Firestore in real-time.
 * excludes the current user.
 */
export function useUsers(currentUserId) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId) {
            setUsers([]);
            setLoading(false);
            return;
        }

        const usersRef = collection(db, 'users');
        // We can't easily filter out a single ID with a where clause if we also want to order by something else 
        // without a composite index. For a small app, client-side filtering is fine.
        const q = query(usersRef, orderBy('email', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                // Map documents to user objects and filter out current user
                const userList = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        uid: doc.id,
                        ...doc.data(),
                    }))
                    .filter((user) => user.uid !== currentUserId);

                // Replace state entirely to prevent duplicates/append issues
                setUsers(userList);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [currentUserId]);

    return { users, loading };
}
