
function Auth({ onLogin }) {
return (
<div className="auth">
<div className="auth-brand">
<div className="auth-logo">BizDash</div>
<div className="auth-tag">Your business, at a glance.</div>
</div>

<div className="glass-card auth-card">
<button className="google-btn" onClick={onLogin}>
<span className="google-icon">G</span>
Continue with Google
</button>
</div>

<div className="auth-footer">
By continuing, you agree to our Terms & Privacy Policy.
</div>
</div>
);
}

export default Auth;