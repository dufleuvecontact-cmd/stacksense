"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type SubscriptionData = {
  plan_type: 'free' | 'premium';
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userIdRef = useRef<string | null>(null);

  const fetchSubscription = useCallback(async (uid: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const [subRes, profileRes] = await Promise.all([
        fetch(`/api/subscription?userId=${uid}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        supabase.from('profiles').select('premium_until').eq('id', uid).single()
      ]);

      const subData = await subRes.json();
      const profileData = profileRes.data;

      const isPremiumByDate = profileData?.premium_until && new Date(profileData.premium_until) > new Date();

      setSubscription({
        ...subData,
        plan_type: (subData.plan_type === 'premium' || isPremiumByDate) ? 'premium' : 'free',
        subscription_status: (subData.subscription_status === 'active' || isPremiumByDate) ? 'active' : 'inactive',
      });

      return (subData.plan_type === 'premium' || isPremiumByDate);
    } catch {
      setSubscription({ plan_type: 'free', subscription_status: 'active' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for premium status after payment (webhook may be delayed)
  const startPolling = useCallback((uid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    let attempts = 0;
    const maxAttempts = 12; // poll for up to 60 seconds

    pollingRef.current = setInterval(async () => {
      attempts++;
      const isPremium = await fetchSubscription(uid);
      if (isPremium || attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 5000);
  }, [fetchSubscription]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        userIdRef.current = session.user.id;
        setUserEmail(session.user.email || null);
        fetchSubscription(session.user.id);
      } else {
        setLoading(false);
        setSubscription({ plan_type: 'free', subscription_status: 'active' });
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        userIdRef.current = session.user.id;
        setUserEmail(session.user.email || null);
        fetchSubscription(session.user.id);
      } else {
        setUserId(null);
        userIdRef.current = null;
        setUserEmail(null);
        setSubscription({ plan_type: 'free', subscription_status: 'active' });
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSubscription]);

  // Supabase Realtime: listen for subscription changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`sub-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchSubscription(userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        () => {
          fetchSubscription(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchSubscription]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const isPremium = subscription?.plan_type === 'premium';

  const refetch = useCallback(() => {
    const uid = userIdRef.current;
    if (uid) {
      setLoading(true);
      fetchSubscription(uid);
    }
  }, [fetchSubscription]);

  const refetchAndPoll = useCallback(() => {
    const uid = userIdRef.current;
    if (uid) {
      fetchSubscription(uid);
      startPolling(uid);
    }
  }, [fetchSubscription, startPolling]);

  const openPortal = useCallback(async () => {
    if (!userId) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch('/api/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    const { url, error } = await response.json();
    if (error) throw new Error(error);
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    window.open(url, '_blank');
  }, [userId]);

  return {
    subscription,
    loading,
    isPremium,
    userId,
    userEmail,
    refetch,
    refetchAndPoll,
    openPortal,
  };
}
