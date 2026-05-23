import { useEffect, useRef, useCallback, useState } from 'react';
import {
  doc,
  setDoc,
  deleteField,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { TYPING_TIMEOUT_MS } from '../firebase/constants';
import { toMillis, isWithinThreshold } from '../firebase/firestoreUtils';

/**
 * Subscribes to other user's typing status and provides a callback to report
 * when the current user is typing. Automatically clears typing status after
 * TYPING_TIMEOUT_MS of inactivity.
 */
export function useTypingIndicator(chatId, currentUserId, otherUserId) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const clearTimeoutRef = useRef(null);

  // Subscribe to other user's typing status
  useEffect(() => {
    if (!chatId || !otherUserId) {
      setIsOtherTyping(false);
      return;
    }

    const convRef = doc(db, 'conversations', chatId);
    const unsubscribe = onSnapshot(convRef, (snapshot) => {
      if (!snapshot.exists()) {
        setIsOtherTyping(false);
        return;
      }
      const typingData = snapshot.data()?.typing || {};
      const isTyping = typingData.userId === otherUserId;
      const updatedAt = toMillis(typingData.timestamp);
      setIsOtherTyping(isTyping && isWithinThreshold(updatedAt, TYPING_TIMEOUT_MS));
    });

    return unsubscribe;
  }, [chatId, otherUserId]);

  // Callback to report that current user is typing (throttled by caller)
  const reportTyping = useCallback(() => {
    if (!chatId || !currentUserId) return;

    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);

    const convRef = doc(db, 'conversations', chatId);
    setDoc(convRef, {
      typing: {
        userId: currentUserId,
        timestamp: serverTimestamp(),
      },
    }, { merge: true });

    // Auto-clear after timeout so other user sees we stopped typing
    clearTimeoutRef.current = setTimeout(() => {
      setDoc(convRef, {
        typing: deleteField(),
      }, { merge: true });
      clearTimeoutRef.current = null;
    }, TYPING_TIMEOUT_MS);
  }, [chatId, currentUserId]);

  // Cleanup: clear typing status when leaving chat or unmounting
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
      if (chatId && currentUserId) {
        const convRef = doc(db, 'conversations', chatId);
        setDoc(convRef, {
          typing: deleteField(),
        }, { merge: true }).catch(() => { });
      }
    };
  }, [chatId, currentUserId]);

  return { isOtherTyping, reportTyping };
}

