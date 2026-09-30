import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { AppDataProvider } from "./context/AppDataContext";

//screens
import Splash from "./screens/Splash";
import Onboarding from "./screens/Onboarding";
import Auth from "./screens/Auth";
import Dashboard from "./screens/Dashboard";
import Navbar from "./screens/Navbar";
import Log from "./screens/Log";
import Inventory from "./screens/Inventory";
import Analytics from "./screens/Analytics";
import Settings from "./screens/Settings";

function App() {
  const [flowScreen, setScreen] = useState("splash");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const screen = session ? "app" : flowScreen;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (checkingSession || session) return;

    const wantsLogin =
      new URLSearchParams(window.location.search).get("login") === "1";
    const isReturning =
      wantsLogin || localStorage.getItem("bizdash_returning_user");
    const timer = setTimeout(() => {
      setScreen(isReturning ? "auth" : "onboarding");
    }, 1800);
    return () => clearTimeout(timer);
  }, [checkingSession, session]);

    useEffect(() => {
    if (session) {
      document.cookie =
        "bizdash_member=1; domain=.braxcode.com; path=/; max-age=31536000; SameSite=Lax; Secure";
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const saved = localStorage.getItem("bizdash_onboarding");
    if (!saved) return;

    const answers = JSON.parse(saved);

    async function createBusinessIfMissing() {
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      if (existing) {
        localStorage.removeItem("bizdash_onboarding");
        return;
      }

      const { error } = await supabase.from("businesses").insert({
        user_id: session.user.id,
        name: answers.businessName,
        business_type: answers.businessType,
                owner_name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email.split("@")[0],
      });

        if (!error || error.code === "23505") {
        localStorage.removeItem("bizdash_onboarding");
      }
    }

    createBusinessIfMissing();
  }, [session]);

  return (
    <div className="app-shell">
      {screen === "splash" && <Splash />}
      {screen === "onboarding" && (
        <Onboarding
          onDone={() => {
            localStorage.setItem("bizdash_returning_user", "true");
            setScreen("auth");
          }}
        />
      )}
      {screen === "auth" && <Auth />}

      {screen === "app" && (
        <AppDataProvider session={session}>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "log" && <Log />}
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "settings" && <Settings />}

          <Navbar activeScreen={activeTab} onNavigate={setActiveTab} />
        </AppDataProvider>
      )}
    </div>
  );
}
export default App;
