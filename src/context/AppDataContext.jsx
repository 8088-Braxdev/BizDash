import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AppDataContext = createContext(null);

export function AppDataProvider({ session, children }) {
  const [business, setBusiness] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  async function loadBusiness(userId) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      setBusiness(data);
    }
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    if (!userId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadBusiness(userId), loadProfile(userId)]).then(() =>
      setLoading(false),
    );
  }, [userId]);

  const value = {
    business,
    profile,
    loading,
    refreshBusiness: () => loadBusiness(userId),
    refreshProfile: () => loadProfile(userId),
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  return useContext(AppDataContext);
}
