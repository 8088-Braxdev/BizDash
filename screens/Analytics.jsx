function Analytics() {
const isPremium = false;
const weeklyData = [];
const isLoading = false;

return (
<div className="analytics">
<div className="topbar">
<div className="biz-name">Analytics</div>
</div>

<div className="section-head">
<h3>This week</h3>
</div>

{isLoading && (
<div className="empty-state">Loading your data...</div>
)}

{!isLoading && weeklyData.length === 0 && (
<div className="empty-state">
No sales yet this week. Log a transaction to see trends here.
</div>
)}

{!isPremium && (
<div className="glass-card lock-card">
<div className="badge">PREMIUM</div>
<p>
Unlock weekly P&L statements, best-selling product rankings,
and full performance trends.
</p>
</div>
)}
</div>
);
}

export default Analytics;