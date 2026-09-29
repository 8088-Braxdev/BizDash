import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useActiveBusiness } from "../hooks/useActiveBusiness";
import { useProfile } from "../hooks/useProfile";
import { formatTimestamp } from "../utils";

function Analytics() {
  const { business, loading } = useActiveBusiness();
  const { profile, loading: profileLoading } = useProfile();
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  const isPremium =
    profile &&
    profile.is_premium &&
    profile.premium_expires_at &&
    new Date(profile.premium_expires_at) > new Date();

  useEffect(() => {
    if (!business) return;

    async function loadWeeklyData() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("transactions")
        .select("*, products(name)")
        .eq("business_id", business.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setWeeklyData(data);
      }
      setIsLoading(false);
    }

    loadWeeklyData();
  }, [business]);

  // --- Best-selling products: group sales by product, sum quantity ---
  function getBestSellers() {
    const salesOnly = weeklyData.filter(
      (tx) => tx.type === "sale" && tx.product_id
    );

    const totals = {};
    salesOnly.forEach((tx) => {
      const name = tx.products ? tx.products.name : "Unknown";
      const qty = Number(tx.quantity) || 0;
      totals[name] = (totals[name] || 0) + qty;
    });

    return Object.entries(totals)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }

  // --- Daily trend: net profit per day for the last 7 days ---
  function getDailyTrend() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    return days.map((day) => {
      const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
      const dayString = day.toDateString();

      const txForDay = weeklyData.filter(
        (tx) => new Date(tx.created_at).toDateString() === dayString
      );

      const net = txForDay.reduce(
        (sum, tx) =>
          sum + (tx.type === "sale" ? Number(tx.amount) : -Number(tx.amount)),
        0
      );

      return { label: dayLabel, net };
    });
  }

  // --- Sort the weekly transaction list (newest first, or highest amount) ---
  function getSortedWeeklyData() {
    const sorted = [...weeklyData];
    if (sortBy === "amount") {
      sorted.sort((a, b) => b.amount - a.amount);
    }
    return sorted; // "newest" needs no re-sort — Supabase already returns it that way
  }

  if (loading || profileLoading) {
    return (
      <div className="analytics">
        <div className="topbar">
          <div className="biz-name">Analytics</div>
        </div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  const bestSellers = getBestSellers();
  const dailyTrend = getDailyTrend();
  const sortedWeeklyData = getSortedWeeklyData();
  const maxAbsNet = Math.max(...dailyTrend.map((d) => Math.abs(d.net)), 1);

  return (
    <div className="analytics">
      <div className="topbar">
        <div className="biz-name">Analytics</div>
      </div>

      <div className="section-head">
        <h3>This week</h3>
      </div>

      {isPremium ? (
        <>
          {isLoading && <div className="empty-state">Loading your data...</div>}

          {!isLoading && weeklyData.length === 0 && (
            <div className="empty-state">
              No sales yet this week. Log a transaction to see trends here.
            </div>
          )}

          {!isLoading && weeklyData.length > 0 && (
            <>
              <div className="glass-card summary-card">
                <div className="summary-row">
                  <span>Total Sales</span>
                  <span className="tx-sale">
                    TZS{" "}
                    {weeklyData
                      .filter((tx) => tx.type === "sale")
                      .reduce((sum, tx) => sum + Number(tx.amount), 0)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Total Expenses</span>
                  <span className="tx-expense">
                    TZS{" "}
                    {weeklyData
                      .filter((tx) => tx.type === "expense")
                      .reduce((sum, tx) => sum + Number(tx.amount), 0)}
                  </span>
                </div>
                <div className="summary-row net-profit">
                  <span>Net Profit</span>
                  <span>
                    TZS{" "}
                    {weeklyData.reduce(
                      (sum, tx) =>
                        sum +
                        (tx.type === "sale"
                          ? Number(tx.amount)
                          : -Number(tx.amount)),
                      0
                    )}
                  </span>
                </div>
              </div>

              <div className="section-head">
                <h3>Best sellers</h3>
              </div>

              {bestSellers.length === 0 ? (
                <div className="empty-state">No product sales yet this week.</div>
              ) : (
                <div className="best-sellers-list">
                  {bestSellers.map((item, index) => (
                    <div key={item.name} className="glass-card ranking-item">
                      <span className="rank-number">#{index + 1}</span>
                      <span className="rank-name">{item.name}</span>
                      <span className="rank-qty">{item.qty} sold</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="section-head">
                <h3>Daily trend</h3>
              </div>

              <div className="glass-card trend-card">
                {dailyTrend.map((day) => (
                  <div key={day.label} className="trend-row">
                    <span className="trend-label">{day.label}</span>
                    <div className="trend-bar-track">
                      <div
                        className={
                          day.net >= 0 ? "trend-bar-positive" : "trend-bar-negative"
                        }
                        style={{
                          width: (Math.abs(day.net) / maxAbsNet) * 100 + "%",
                        }}
                      ></div>
                    </div>
                    <span className="trend-value">TZS {day.net}</span>
                  </div>
                ))}
              </div>

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

              <div className="weekly-list">
                {sortedWeeklyData.map((tx) => (
                  <div key={tx.id} className="glass-card tx-item">
                    <div>
                      <span className={tx.type === "sale" ? "tx-sale" : "tx-expense"}>
                        {tx.type === "sale" ? "Sale" : "Expense"}
                      </span>
                      <div className="tx-time">{formatTimestamp(tx.created_at)}</div>
                    </div>
                    <span className="tx-amount">TZS {tx.amount}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="glass-card lock-card">
          <div className="badge">PREMIUM</div>
          <p>
            Unlock weekly P&L statements, best-selling product rankings, and
            full performance trends.
          </p>
        </div>
      )}
    </div>
  );
}

export default Analytics;