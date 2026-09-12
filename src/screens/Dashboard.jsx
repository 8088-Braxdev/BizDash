import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useActiveBusiness } from "../hooks/useActiveBusiness";
import { formatTimestamp } from "../utils";

function Dashboard() {
  const { business } = useActiveBusiness();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  function getSortedTransactions() {
    const sorted = [...transactions];
    if (sortBy === "amount") {
      sorted.sort((a, b) => b.amount - a.amount);
    }
    return sorted; // 'newest' needs no re-sort — Supabase already returns it that way
  }

  const sortedTransactions = getSortedTransactions();

  const totalSales = transactions
    .filter((tx) => tx.type === "sale")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netProfit = totalSales - totalExpenses;

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const photo =
          user.user_metadata.avatar_url ||
          user.user_metadata.picture ||
          (user.identities &&
          user.identities[0] &&
          user.identities[0].identity_data
            ? user.identities[0].identity_data.avatar_url
            : "");
        setAvatarUrl(photo || "");
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (business && business.owner_name) {
      setFirstName(business.owner_name.split(" ")[0]);
    }
  }, [business]);

  useEffect(() => {
    if (!business) return;

    async function loadTransactions() {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("business_id", business.id)
        .gte("created_at", startOfToday.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setTransactions(data);
      }
      setIsLoading(false);
    }

    loadTransactions();
  }, [business]);

  return (
    <div className="dashboard">
      <div className="topbar">
        <div>
          <div className="greet">
            Habari{firstName ? ", " + firstName : ""} 👋
          </div>
          <div className="biz-name">
            {business ? business.name : "Your Business"}
          </div>
        </div>
        <div className="avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="avatar-img1" />
          ) : (
            "?"
          )}
        </div>
      </div>

      <div className="glass-card hero-card">
        <div className="hero-label">TODAY'S NET PROFIT</div>
        <div className="hero-amount">TZS {netProfit}</div>
      </div>

      <div className="stat-row">
        <div className="glass-card stat-card">
          <div className="stat-lab">Sales</div>
          <div className="stat-val sales">TZS {totalSales}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-lab">Expenses</div>
          <div className="stat-val expenses">TZS {totalExpenses}</div>
        </div>
      </div>

      <div className="section-head">
        <h3>Recent activity</h3>
      </div>

      {isLoading && (
        <div className="empty-state">Loading your transactions...</div>
      )}

      {!isLoading && transactions.length > 0 && (
        <div className="sort-row">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="amount">Highest amount</option>
          </select>
        </div>
      )}

      {sortedTransactions.map((tx) => (
        <div key={tx.id} className="glass-card tx-item">
          <div>
            <span className={tx.type === "sale" ? "tx-sale" : "tx-expense"}>
              {tx.type === "sale" ? "Sale" : "Expense"}
            </span>

            <div className="tx-time">{formatTimestamp(tx.created_at)}</div>
            <div className="tx-amount">TZS {tx.amount}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;