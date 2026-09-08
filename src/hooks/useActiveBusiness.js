import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useActiveBusiness() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('No authenticated user');
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id);

        if (dbError) throw dbError;

        setBusiness(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, []);

  return { business, loading, error };
}