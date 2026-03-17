"use client";

import React, { createContext, useContext } from "react";
import { useSubscription, SubscriptionData } from "./useSubscription";

type SubscriptionContextValue = {
  subscription: SubscriptionData | null;
  loading: boolean;
  isPremium: boolean;
  userId: string | null;
  userEmail: string | null;
  refetch: () => void;
  refetchAndPoll: () => void;
  openPortal: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscription();
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Drop-in replacement — same API as useSubscription()
export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  return ctx;
}
