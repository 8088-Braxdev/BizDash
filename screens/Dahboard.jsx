function Dashboard() {
const transactions = [];
const isLoading = false;

return (
<div className="dashboard">
<div className="topbar">
<div>
<div className="greet">Habari 👋</div>
<div className="biz-name">Your Business</div>
</div>
<div className="avatar">?</div>
</div>

<div className="glass-card hero-card">
<div className="hero-label">TODAY'S NET PROFIT</div>
<div className="hero-amount">TZS 0</div>
</div>

<div className="stat-row">
<div className="glass-card stat-card">
<div className="stat-lab">Sales</div>
<div className="stat-val sales">0</div>
</div>
<div className="glass-card stat-card">
<div className="stat-lab">Expenses</div>
<div className="stat-val expenses">0</div>
</div>
</div>

<div className="section-head">
<h3>Recent activity</h3>
</div>

{isLoading && (
<div className="empty-state">Loading your transactions...</div>
)}

{!isLoading && transactions.length === 0 && (
<div className="empty-state">
No transactions yet. Log your first sale to see it here.
</div>
)}

{transactions.map((tx) => (
<div key={tx.id} className="glass-card tx-item">
{tx.name}
</div>
))}
</div>
);
}

export default Dashboard;