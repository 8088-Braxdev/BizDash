import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAppData } from "../context/AppDataContext";
import { formatTimestamp } from "../utils";

function NotificationBell() {
  const { business } = useAppData();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!business) return;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
      } else {
        setNotifications(data);
      }
    }

    loadNotifications();
  }, [business]);

  function togglePanel() {
    setOpen(!open);
  }

  async function markAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("business_id", business.id)
      .eq("is_read", false);

    if (error) console.error(error);
  }

  async function markOneRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) console.error(error);
  }

  async function clearAll() {
    if (!business || notifications.length === 0) return;

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("business_id", business.id)
      .select();

    if (error || !data || data.length === 0) {
      console.error(error || "Nothing was deleted - check the delete policy");
      return;
    }

    setNotifications([]);
  }

  return (
    <div className="bell-wrap">
      <button
        className="bell-btn"
        onClick={togglePanel}
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="bell-dot">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="bell-overlay" onClick={togglePanel} />
          <div className="glass-card bell-panel">
            <div className="bell-title">
              <span>Notifications</span>
              <div className="bell-actions">
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type="button" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={n.is_read ? "notif-item" : "notif-item new"}
                  onClick={() => !n.is_read && markOneRead(n.id)}
                >
                  <div className="notif-msg">{n.message}</div>
                  <div className="tx-time">{formatTimestamp(n.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
