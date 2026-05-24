import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signOut, updateProfile,
  EmailAuthProvider, reauthenticateWithCredential,
  verifyBeforeUpdateEmail, deleteUser
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, deleteDoc,
  collection, collectionGroup, query, where, getDocs, writeBatch, addDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authenticatedUser.uid));
          const profileData = userDoc.exists() ? userDoc.data() : {};
          await setDoc(doc(db, 'users', authenticatedUser.uid), { isOnline: true }, { merge: true });
          setUser({ ...authenticatedUser, ...profileData, isOnline: true });
        } catch (error) {
          console.error('Error updating online status/fetching profile:', error);
          setUser(authenticatedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleUnload = () => {
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid), { isOnline: false }, { merge: true });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { isOnline: false }, { merge: true });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Log activity to security_logs collection
  const logActivity = async (action, details = {}) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'security_logs'), {
        uid: auth.currentUser.uid,
        action,
        details,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
      });
    } catch (e) {
      console.warn('Could not log activity:', e);
    }
  };

  // Re-authenticate with password
  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  // Update displayName / about
  const updateUserProfile = async (data) => {
    if (!auth.currentUser) return;
    try {
      const updates = {};
      if (data.username !== undefined) {
        await updateProfile(auth.currentUser, { displayName: data.username });
        updates.username = data.username;
        updates.displayName = data.username;
      }
      if (data.about !== undefined) updates.about = data.about;
      await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });
      setUser(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Update Avatar (Custom upload or Preset)
  const updateUserAvatar = async (data) => {
    if (!auth.currentUser) return;
    try {
      const { type, url, presetId } = data;
      const updates = {
        avatarType: type,
        photoURL: url || null,
        presetAvatarId: presetId || null,
      };

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: url || null });

      // Update Firestore users document
      await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });

      // Update local state
      setUser(prev => ({ ...prev, ...updates }));

      await logActivity('avatar_updated', { type, presetId });
      return { success: true };
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  // Change email — sends verification to new email first
  const changeEmail = async (password, newEmail) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    await reauthenticate(password);
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    await logActivity('email_change_requested', { newEmail });
    return { success: true };
  };

  // Update security notification preference in Firestore
  const setSecurityNotifications = async (enabled) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'user_settings', auth.currentUser.uid);
    await setDoc(ref, { securityNotifications: enabled }, { merge: true });
    setUser(prev => ({ ...prev, securityNotifications: enabled }));
    await logActivity('security_notifications_toggled', { enabled });
  };

  // Fetch account settings from Firestore
  const getAccountSettings = async () => {
    if (!auth.currentUser) return {};
    const ref = doc(db, 'user_settings', auth.currentUser.uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
  };

  // Phone number update in Firestore
  const updatePhoneNumber = async (password, phone) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    await reauthenticate(password);
    await setDoc(doc(db, 'users', auth.currentUser.uid), { phone }, { merge: true });
    setUser(prev => ({ ...prev, phone }));
    await logActivity('phone_number_changed', {});
    return { success: true };
  };

  // Generate and download account data JSON
  const requestAccountInfo = async () => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const uid = auth.currentUser.uid;

    const userDoc = await getDoc(doc(db, 'users', uid));
    const settingsDoc = await getDoc(doc(db, 'user_settings', uid));

    // Fetch messages where user is sender
    const msgsQuery = query(collectionGroup(db, 'messages'), where('senderId', '==', uid));
    const msgsSnapshot = await getDocs(msgsQuery);
    const messages = msgsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const data = {
      exportedAt: new Date().toISOString(),
      profile: userDoc.exists() ? userDoc.data() : {},
      settings: settingsDoc.exists() ? settingsDoc.data() : {},
      messages,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-data-${uid}.json`;
    a.click();
    URL.revokeObjectURL(url);

    await logActivity('account_data_requested', {});
    return { success: true };
  };

  // Delete account — removes Firestore data then deletes Firebase Auth user
  const deleteAccount = async (password) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const uid = auth.currentUser.uid;

    await reauthenticate(password);
    await logActivity('account_deleted', {});

    const batch = writeBatch(db);

    // Soft-delete: mark user as deleted
    batch.set(doc(db, 'users', uid), {
      deleted: true,
      deletedAt: serverTimestamp(),
      isOnline: false,
    }, { merge: true });

    // Delete user_settings
    batch.delete(doc(db, 'user_settings', uid));

    await batch.commit();

    // Delete Firebase Auth user
    await deleteUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      logout,
      updateUserProfile,
      updateUserAvatar,
      changeEmail,
      setSecurityNotifications,
      getAccountSettings,
      updatePhoneNumber,
      requestAccountInfo,
      deleteAccount,
      reauthenticate,
      logActivity,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
