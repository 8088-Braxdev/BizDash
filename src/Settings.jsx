

function Settings() {
return (
<div className="settings">
<div className="topbar">
<div className="biz-name">Settings</div>
</div>

<div className="glass-card plan-card">
<div className="plan-label">Current plan</div>
<div className="plan-name">Free tier</div>
<button className="upgrade-btn">Upgrade to Premium</button>
</div>

<div className="section-head">
<h3>Business</h3>
</div>
<div className="glass-card set-item">Business profile</div>
<div className="glass-card set-item">Currency — TZS</div>

<div className="section-head">
<h3>Support</h3>
</div>
<div className="glass-card set-item">Chat with us on WhatsApp</div>
<div className="glass-card set-item">Help center</div>
</div>
);
}

export default Settings;