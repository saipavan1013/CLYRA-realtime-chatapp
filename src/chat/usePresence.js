import { useEffect, useState, useMemo } from 'react';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  PRESENCE_ONLINE_THRESHOLD_MS,
  PRESENCE_UPDATE_INTERVAL_MS,
} from '../firebase/constants';
import { toMillis, isWithinThreshold } from '../firebase/firestoreUtils';

/** Parses presence snapshot and returns whether user is considered online */
function parsePresenceSnapshot(snapshot) {
  if (!snapshot.exists()) return false;
  const lastSeen = toMillis(snapshot.data()?.lastSeen);
  return isWithinThreshold(lastSeen, PRESENCE_ONLINE_THRESHOLD_MS);
}

/**
 * Updates current user's presence in Firestore on an interval.
 * Call when user is active (e.g. on ChatPage mount).
 */
export function usePresence(userId) {
  useEffect(() => {
    if (!userId) return;

    const presenceRef = doc(db, 'presence', userId);
    const updatePresence = () =>
      setDoc(presenceRef, { lastSeen: serverTimestamp() });

    updatePresence();
    const interval = setInterval(updatePresence, PRESENCE_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userId]);
}

/**
 * Subscribes to a single user's presence and returns whether they are online.
 */
export function useOtherPresence(otherUserId) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!otherUserId) {
      setIsOnline(false);
      return;
    }

    const presenceRef = doc(db, 'presence', otherUserId);
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      setIsOnline(parsePresenceSnapshot(snapshot));
    });

    return unsubscribe;
  }, [otherUserId]);

  return isOnline;
}

/**
 * Subscribes to multiple users' presence and returns a map of userId -> isOnline.
 * Efficient for chat lists where we need status for several contacts.
 */
export function usePresenceMap(userIds) {
  const [presenceByUserId, setPresenceByUserId] = useState({});

  const stableUserIds = useMemo(
    () => [...(userIds || [])].filter(Boolean),
    [Array.isArray(userIds) ? userIds.join(',') : '']
  );

  useEffect(() => {
    if (stableUserIds.length === 0) {
      setPresenceByUserId({});
      return;
    }

    const unsubscribes = stableUserIds.map((userId) => {
      const presenceRef = doc(db, 'presence', userId);
      return onSnapshot(presenceRef, (snapshot) => {
        setPresenceByUserId((prev) => ({
          ...prev,
          [userId]: parsePresenceSnapshot(snapshot),
        }));
      });
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [stableUserIds]);

  return presenceByUserId;
}
