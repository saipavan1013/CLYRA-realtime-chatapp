import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { getAuthErrorMessage } from '../auth/authErrors';
import { useAuthForm } from '../hooks/useAuthForm';
import AuthFormCard from '../components/AuthFormCard';
import Logo from '../components/Logo';

function LoginPage() {
  const navigate = useNavigate();
  const form = useAuthForm({ requireConfirm: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    form.clearSubmitError();
    if (!form.validate()) return;

    form.setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);

      // Update isOnline status only (merge: true prevents creating new document)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        isOnline: true,
      }, { merge: true });

      navigate('/chat', { replace: true });
    } catch (err) {
      form.setSubmitError(getAuthErrorMessage(err.code) || 'Login failed');
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
        title="Login"
        submitLabel="Sign in"
        submitLoadingLabel="Signing in..."
        loading={form.loading}
        submitError={form.submitError}
        onSubmit={handleSubmit}
        footerText="Don't have an account?"
        footerLinkTo="/register"
        footerLinkLabel="Register"
      >
        <AuthFormCard.Field
          id="login-username"
          type="text"
          value={form.username}
          onChange={(e) => form.setUsername(e.target.value)}
          placeholder="Username"
          error={form.errors.username}
          autoComplete="username"
        />
        <AuthFormCard.Field
          id="login-email"
          type="email"
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
          placeholder="Email"
          error={form.errors.email}
          autoComplete="email"
        />
        <AuthFormCard.Field
          id="login-password"
          type="password"
          value={form.password}
          onChange={(e) => form.setPassword(e.target.value)}
          placeholder="Password"
          error={form.errors.password}
          autoComplete="current-password"
        />
      </AuthFormCard>
    </div>
  );
}

export default LoginPage;
