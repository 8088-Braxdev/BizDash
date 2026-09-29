import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useActiveBusiness } from "../hooks/useActiveBusiness";

const PLANS = [
  { id: "monthly", label: "1 Month", price: 5000 },
  { id: "quarterly", label: "3 Months", price: 13500 },
  { id: "biannual", label: "6 Months", price: 24000 },
  { id: "annual", label: "1 Year", price: 42000 },
];

const BUSINESS_TYPES = [
  "Retail Shop",
  "Restaurant/Food",
  "Salon/Beauty",
  "Electronics",
  "Services",
  "Other",
];

const FAQS = [
  {
    q: "How do I upgrade to Premium?",
    a: "Go to the top of Settings, pick a plan, then notify Braxton via WhatsApp, SMS, or call after paying.",
  },
  {
    q: "What currency does BizDash use?",
    a: "TZS only for now. More currencies may be added later.",
  },
  {
    q: "How long does it take to activate Premium?",
    a: "As soon as your payment is matched, usually within a few hours.",
  },
];

const WHATSAPP_NUMBER = "255618811359";

function Settings() {
  const { business, loading } = useActiveBusiness();

  const [displayName, setDisplayName] = useState(null);
  const shownName = displayName ?? business?.owner_name ?? "";
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [editingBusiness, setEditingBusiness] = useState(false);
  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("");
  const [savingBiz, setSavingBiz] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const [openFAQ, setOpenFAQ] = useState(null);
  const [showFAQPanel, setShowFAQPanel] = useState(false);

  const isPremiumActive =
    business &&
    business.is_premium &&
    business.premium_expires_at &&
    new Date(business.premium_expires_at) > new Date();

  const daysLeft =
    business && business.premium_expires_at
      ? Math.ceil(
          (new Date(business.premium_expires_at) - new Date()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

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

  function showToast(message, type) {
    setToast({ message: message, type: type });
    setTimeout(() => setToast(null), 3000);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function saveDisplayName() {
    setSavingName(true);
    const { error } = await supabase
      .from("businesses")
      .update({ owner_name: shownName })
      .eq("id", business.id);
    setSavingName(false);
    if (error) {
      console.error(error);
      showToast("Couldn't save name — try again", "error");
      return;
    }
    setEditingName(false);
    showToast("Name saved", "success");
  }

  async function saveBusinessProfile() {
    setSavingBiz(true);
    const { error } = await supabase
      .from("businesses")
      .update({ name: bizName, business_type: bizType })
      .eq("id", business.id);
    setSavingBiz(false);
    if (error) {
      console.error(error);
      showToast("Couldn't save business profile — try again", "error");
      return;
    }
    setEditingBusiness(false);
    showToast("Business profile updated", "success");
  }
  function openBusinessEdit() {
    setBizName(business?.name || "");
    setBizType(business?.business_type || "");
    setEditingBusiness(true);
  }
  function cancelUpgrade() {
    setSelectedPlan(null);
    setShowUpgrade(false);
  }

  function buildPaymentMessage() {
    const name = business ? business.name : "my business";
    return (
      "Hi Braxton, I have paid for the " +
      selectedPlan.label +
      " plan (TZS " +
      selectedPlan.price +
      ') for "' +
      name +
      '" on BizDash.'
    );
  }

  function notifyWhatsApp() {
    const text = encodeURIComponent(buildPaymentMessage());
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank");
  }

  function notifySMS() {
    const text = encodeURIComponent(buildPaymentMessage());
    window.location.href = "sms:" + WHATSAPP_NUMBER + "?body=" + text;
  }

  function notifyCall() {
    window.location.href = "tel:" + WHATSAPP_NUMBER;
  }

  function chatSupportWhatsApp() {
    const name = business ? business.name : "my business";
    const text = encodeURIComponent(
      'Hi Braxton, I need support with BizDash for "' + name + '".',
    );
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text, "_blank");
  }

  if (loading) {
    return (
      <div className="settings">
        <div className="topbar">
          <div className="biz-name">Settings</div>
        </div>
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="topbar">
        <div className="biz-name">Settings</div>
      </div>

      <div className="glass-card plan-card">
        <div className="plan-label">Current plan</div>
        <div className="plan-name">
          {isPremiumActive ? "Premium" : "Free tier"}
        </div>

        {isPremiumActive && daysLeft !== null && (
          <div className="expiry-note">
            Expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
          </div>
        )}

        {isPremiumActive && daysLeft !== null && daysLeft <= 7 && (
          <div className="renew-banner">
            Your subscription expires soon — renew below to stay on Premium.
          </div>
        )}

        {!isPremiumActive && (
          <>
            {!showUpgrade && (
              <button
                className="upgrade-btn"
                onClick={() => setShowUpgrade(true)}
              >
                Upgrade to Premium
              </button>
            )}

            {showUpgrade && (
              <div className="upgrade-panel">
                <div className="plan-chips">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={
                        selectedPlan && selectedPlan.id === plan.id
                          ? "chip chip-active"
                          : "chip"
                      }
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.label} — TZS {plan.price}
                    </div>
                  ))}
                </div>

                {selectedPlan && (
                  <div className="notify-options">
                    <p className="notify-hint">
                      Pay via mobile money, then notify me:
                    </p>
                    <button
                      className="notify-btn whatsapp"
                      onClick={notifyWhatsApp}
                    >
                      I've Paid — WhatsApp
                    </button>
                    <button className="notify-btn sms" onClick={notifySMS}>
                      I've Paid — SMS
                    </button>
                    <button className="notify-btn call" onClick={notifyCall}>
                      Call Braxton
                    </button>
                  </div>
                )}

                <button className="cancel-btn" onClick={cancelUpgrade}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="section-head">
        <h3>Profile</h3>
      </div>
      <div className="glass-card set-item name-item">
        {avatarUrl && (
          <img src={avatarUrl} alt="Profile" className="avatar-img" />
        )}
        {editingName ? (
          <>
            <input
              type="text"
              value={shownName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="name-input1"
            />
            <button onClick={saveDisplayName} disabled={savingName}>
              {savingName ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <>
            <span>{shownName || "Add your name"}</span>
            <button onClick={() => setEditingName(true)}>Edit</button>
          </>
        )}
      </div>

      <div className="section-head">
        <h3>Business</h3>
      </div>

      {editingBusiness ? (
        <div className="glass-card business-edit-panel">
          <input
            type="text"
            value={bizName}
            onChange={(e) => setBizName(e.target.value)}
            className="name-input"
            placeholder="Business name"
          />
          <div className="plan-chips">
            {BUSINESS_TYPES.map((type) => (
              <div
                key={type}
                className={bizType === type ? "chip chip-active" : "chip"}
                onClick={() => setBizType(type)}
              >
                {type}
              </div>
            ))}
          </div>
          <div className="business-edit-actions">
            <button onClick={saveBusinessProfile} disabled={savingBiz}>
              {savingBiz ? "Saving..." : "Save"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setEditingBusiness(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="glass-card set-item clickable"
          onClick={openBusinessEdit}
        >
          <span>{business ? business.name : "Business profile"}</span>
          <span className="set-item-sub">
            {business ? business.business_type : ""}
          </span>
        </div>
      )}

      <div className="glass-card set-item">
        Currency — {business ? business.currency : "TZS"}
      </div>

      <div className="section-head">
        <h3>Support</h3>
      </div>
      <div
        className="glass-card set-item clickable"
        onClick={chatSupportWhatsApp}
      >
        Chat with us on WhatsApp
      </div>
      <div
        className="glass-card set-item clickable"
        onClick={() => setShowFAQPanel(!showFAQPanel)}
      >
        Help center
      </div>

      {showFAQPanel && (
        <div className="faq-panel">
          {FAQS.map((item, index) => (
            <div key={index} className="glass-card faq-item">
              <div
                className="faq-question"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                {item.q}
              </div>
              {openFAQ === index && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      )}

      <button className="signout-btn" onClick={signOut}>
        Sign out
      </button>

      {toast && (
        <div className={"toast toast-" + toast.type}>{toast.message}</div>
      )}
    </div>
  );
}

export default Settings;
