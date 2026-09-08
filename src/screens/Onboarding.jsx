import { useState } from "react";

const BUSINESS_TYPES = ["Retail", "Food & Drinks", "Salon & Beauty", "Services", "Other"];

function Onboarding({ onDone }) {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");

  function handleContinue() {
    const answers = {
      businessName: businessName,
      businessType: businessType
    };
    localStorage.setItem("bizdash_onboarding", JSON.stringify(answers));
    onDone();
  }

  const canContinue = businessName.trim() !== "" && businessType !== "";

  return (
    <div className="onboarding">
      <div className="glass-card onboarding-card">
        <h2>Let's set up your business</h2>

        <input
          type="text"
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <div className="chip-row">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type}
              className={type === businessType ? "chip chip-active" : "chip"}
              onClick={() => setBusinessType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          className="google-btn"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default Onboarding;