import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { getAuthErrorMessage } from '../auth/authErrors';
import { useAuthForm } from '../hooks/useAuthForm';
import AuthFormCard from '../components/AuthFormCard';
import Logo from '../components/Logo';

function RegisterPage() {
  const navigate = useNavigate();
  const form = useAuthForm({ requireConfirm: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    form.clearSubmitError();
    if (!form.validate()) return;

    form.setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Update Firebase Auth profile displayName immediately
      await updateProfile(user, {
        displayName: form.username
      });

      // Create user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: form.username,
        displayName: form.username, // Set displayName for compatibility
        createdAt: serverTimestamp(),
        isOnline: true,
      }, { merge: true });

      navigate('/chat', { replace: true });
    } catch (err) {
      form.setSubmitError(getAuthErrorMessage(err.code) || `Error: ${err.message}`);
    } finally {
      form.setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <Logo size={180} />
      </div>
      <AuthFormCard
        title="Register"
        submitLabel="Create account"
        submitLoadingLabel="Creating account..."
        loading={form.loading}
        submitError={form.submitError}
        onSubmit={handleSubmit}
        footerText="Already have an account?"
        footerLinkTo="/login"
        footerLinkLabel="Login"
      >
        <AuthFormCard.Field
          id="register-username"
          type="text"
          value={form.username}
          onChange={(e) => form.setUsername(e.target.value)}
          placeholder="Username"
          error={form.errors.username}
          autoComplete="username"
        />
        <AuthFormCard.Field
          id="register-email"
          type="email"
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
          placeholder="Email"
          error={form.errors.email}
          autoComplete="email"
        />
        <AuthFormCard.Field
          id="register-password"
          type="password"
          value={form.password}
          onChange={(e) => form.setPassword(e.target.value)}
          placeholder="Password"
          error={form.errors.password}
          autoComplete="new-password"
        />
        <AuthFormCard.Field
          id="register-confirm"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => form.setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          error={form.errors.confirmPassword}
          autoComplete="new-password"
        />
      </AuthFormCard>
    </div>
  );
}

export default RegisterPage;
