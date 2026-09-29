import { supabase } from "../supabaseClient";
const TERMS_URL = "https://bizdash.braxcode.com/legal/terms.html";
const PRIVACY_URL = "https://bizdash.braxcode.com/legal/privacy.html";
function Auth() {
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  return (
    <div className="auth">
        <div className="auth-brand">
        <img src="/logo.png" alt="BizDash logo" className="auth-img" />
        <div className="auth-logo">BizDash</div>
        <div className="auth-tag">Your business, at a glance.</div>
      </div>

      <div className="glass-card auth-card">
        <button className="google-btn" onClick={handleGoogleLogin}>
          <span className="google-icon">G</span>
          Continue with Google
        </button>
      </div>

      <div className="auth-footer">
        By continuing, you agree to our{" "}
        <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Terms</a>
        {" "}&{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
      </div>
    </div>
  );
}

export default Auth;