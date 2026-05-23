import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
  updateDoc,
  deleteDoc,
  deleteField,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';
import { toMillis } from '../firebase/firestoreUtils';

/**
 * Real-time subscription to chat messages with support for multimedia.
 */
export function useChatMessages(chatId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'conversations', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const batch = writeBatch(db);
        let hasUpdates = false;

        const allMsgs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const timestamp = toMillis(data.createdAt) || Date.now();
          const isSent = data.senderId === currentUserId;

          if (!isSent) {
            const updates = {};
            if (!data.delivered) updates.delivered = true;
            if (!data.seen) updates.seen = true;

            if (Object.keys(updates).length > 0) {
              batch.update(docSnap.ref, updates);
              hasUpdates = true;
            }
          }

          return {
            id: docSnap.id,
            text: data.text || '',
            type: data.type || 'text',
            fileUrl: data.fileUrl || null,
            fileName: data.fileName || null,
            duration: data.duration || null,
            timestamp,
            createdAt: timestamp,
            senderId: data.senderId,
            isSent,
            senderName: data.senderName || null,
            replyTo: data.replyTo || null,
            reactions: data.reactions || {},
            seen: data.seen || false,
            delivered: data.delivered || false,
            edited: data.edited || false,
            deleted: data.deleted || false,
            deletedFor: data.deletedFor || [],
            editedAt: data.editedAt,
          };
        });

        // Filter out messages deleted "for me"
        const msgs = allMsgs.filter(m => !m.deletedFor?.includes(currentUserId));

        if (hasUpdates) {
          batch.commit().catch((err) => console.error('Error marking as seen:', err));
        }

        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore subscribe error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatId, currentUserId]);

  const uploadFile = async (file, pathPrefix = 'others') => {
    if (!chatId) throw new Error('No active conversation');
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `chats/${chatId}/${pathPrefix}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, name: file.name };
  };

  const sendMessage = async (payload) => {
    if (!chatId || !currentUserId) return;

    const {
      text = '',
      type = 'text',
      fileUrl = null,
      fileName = null,
      duration = null,
      replyTo = null
    } = typeof payload === 'string' ? { text: payload } : payload;

    if (type === 'text' && !text.trim()) return;

    const msgData = {
      senderId: currentUserId,
      createdAt: serverTimestamp(),
      type,
      seen: false,
      delivered: false,
      deletedFor: [],
    };

    if (text) msgData.text = text.trim();
    if (fileUrl) msgData.fileUrl = fileUrl;
    if (fileName) msgData.fileName = fileName;
    if (duration) msgData.duration = duration;
    if (replyTo) msgData.replyTo = replyTo;

    const messagesRef = collection(db, 'conversations', chatId, 'messages');
    await addDoc(messagesRef, msgData);

    const conversationRef = doc(db, 'conversations', chatId);
    const lastMsgText = type === 'text' ? text.trim() : `Shared a ${type}`;
    await setDoc(conversationRef, {
      lastMessage: lastMsgText,
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: currentUserId,
    }, { merge: true });
  };

  const editMessage = async (messageId, newText) => {
    if (!chatId || !messageId || !newText?.trim()) return;
    try {
      const messageRef = doc(db, 'conversations', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        text: newText.trim(),
        edited: true,
        editedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error editing message:', err);
    }
  };

  const deleteMessage = async (messageId, mode = 'everyone') => {
    if (!chatId || !messageId) return;
    try {
      const messageRef = doc(db, 'conversations', chatId, 'messages', messageId);

      if (mode === 'everyone') {
        await updateDoc(messageRef, {
          text: "This message was deleted",
          deleted: true,
          deletedAt: serverTimestamp(),
        });
      } else {
        // WhatsApp style "Delete for me"
        await updateDoc(messageRef, {
          deletedFor: arrayUnion(currentUserId)
        });
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const bulkDeleteMessages = async (messageIds, mode = 'everyone') => {
    if (!chatId || !messageIds?.length) return;
    try {
      const promises = messageIds.map(id => {
        const messageRef = doc(db, 'conversations', chatId, 'messages', id);
        if (mode === 'everyone') {
          return updateDoc(messageRef, {
            text: "This message was deleted",
            deleted: true,
            deletedAt: serverTimestamp(),
          });
        } else {
          return updateDoc(messageRef, {
            deletedFor: arrayUnion(currentUserId)
          });
        }
      });
      await Promise.all(promises);
    } catch (err) {
      console.error('Error bulk deleting messages:', err);
    }
  };

  return {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    bulkDeleteMessages,
    uploadFile,
    loading
  };
}

export async function reactToMessage(chatId, messageId, userId, emoji) {
  if (!chatId || !messageId || !userId) return;
  try {
    const messageRef = doc(db, 'conversations', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${userId}`]: emoji
    });
  } catch (err) {
    console.error('Error reacting to message:', err);
  }
}

export async function unreactFromMessage(chatId, messageId, userId) {
  if (!chatId || !messageId || !userId) return;
  try {
    const messageRef = doc(db, 'conversations', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${userId}`]: deleteField()
    });
  } catch (err) {
    console.error('Error unreacting from message:', err);
  }
}
