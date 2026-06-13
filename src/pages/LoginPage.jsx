import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
      let loginEmail = form.email.trim();

      // Support logging in via Username: if input doesn't contain '@', it's a username!
      if (!loginEmail.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', loginEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw { code: 'auth/user-not-found', message: 'No account found with this username.' };
        }

        const matchedUser = querySnapshot.docs[0].data();
        loginEmail = matchedUser.email;
      }

      const { user } = await signInWithEmailAndPassword(auth, loginEmail, form.password);

      // Update isOnline status only (merge: true prevents creating new document)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        isOnline: true,
      }, { merge: true });

      navigate('/chat', { replace: true });
    } catch (err) {
      form.setSubmitError(getAuthErrorMessage(err.code) || err.message || 'Login failed');
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
          id="login-email"
          type="text"
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
          placeholder="Username or Email"
          error={form.errors.email}
          autoComplete="username"
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
        <div className="login-forgot-link-container">
          <Link to="/forgot-password" id="login-forgot-password-link" className="login-forgot-link">
            Forgot password?
          </Link>
        </div>
      </AuthFormCard>
    </div>
  );
}

export default LoginPage;

