"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  ArrowLeft,
  Loader2,
  Brain,
  Download,
  Cloud,
  Target,
  FlaskConical,
  Activity } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionContext as useSubscription } from '@/hooks/SubscriptionContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const FREE_FEATURES = [
{ name: "Advanced supplement tracking", included: true },
{ name: "Up to 8 stack items", included: true },
{ name: 'Basic dose logging', included: true },
{ name: 'Weight tracking', included: true },
{ name: 'AI interactions detection', included: false },
{ name: 'Bioavailability calculator', included: false },
  { name: 'Cloud sync & backup', included: false },
{ name: 'Priority AI responses', included: false },
{ name: 'Symptom tracking', included: false },
{ name: 'Protocol templates', included: false }];


const PREMIUM_FEATURES = [
{ icon: Brain, name: 'AI Interactions & Bioavailability', desc: 'Smart supplement analysis' },
{ icon: Cloud, name: 'Cloud Sync & Backup', desc: 'Access across devices' },
{ icon: Zap, name: 'Enhanced AI Assistant', desc: 'Priority responses' },
{ icon: Activity, name: 'Advanced Logging', desc: 'Mood, energy, sleep' },
{ icon: Target, name: 'Goals & Coaching', desc: 'AI-powered guidance' },
{ icon: FlaskConical, name: 'Protocol Templates', desc: 'Pre-built cycles' }];


function CheckoutForm({ onSuccess, onCancel, userId }: {onSuccess: () => void;onCancel: () => void; userId: string | null;}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      toast.success('Welcome to Premium! Your account is being upgraded...');
      onSuccess();
    } else if (paymentIntent?.status === 'processing') {
      toast.success('Payment processing - your account will upgrade shortly.');
      onSuccess();
    } else {
      setError('Unexpected payment status. Please contact support.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-h-[300px] overflow-y-auto pr-2">
        <PaymentElement
          options={{
            layout: 'tabs'
          }} />

      </div>
      {error &&
      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      }
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 rounded-xl font-bold dark:border-zinc-800">

          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold">

          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe $7.99/mo'}
        </Button>
      </div>
    </form>);

}

export function PricingTab({ onClose }: {onClose: () => void;}) {
  const { userId, userEmail, isPremium, refetch, refetchAndPoll } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devGrantLoading, setDevGrantLoading] = useState(false);

  const isDevGrantEnabled =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_DEV_GRANT_PREMIUM === 'true';

  const handleUpgrade = async () => {
    if (!userId || !userEmail) {
      toast.error('Please sign in to upgrade');
      return;
    }

    setLoading(true);
    try {
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token;

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
      setShowCheckout(true);
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleDevGrant = async () => {
    if (!userId) {
      toast.error('Please sign in to grant premium.');
      return;
    }

    setDevGrantLoading(true);

    const getSession = await supabase.auth.getSession();
    const token = getSession.data.session?.access_token;

    if (!token) {
      toast.error('Unable to get auth token.');
      setDevGrantLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/dev/grant-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Grant failed');
      }

      toast.success('Developer premium granted!');
      refetchAndPoll();
    } catch (err) {
      console.error('Dev grant error:', err);
      toast.error('Failed to grant developer premium.');
    } finally {
      setDevGrantLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    setClientSecret(null);
    // Start polling for premium status - webhook may take a few seconds
    refetchAndPoll();
  };

  if (isPremium) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-24 dark:bg-zinc-950">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
            <h2 className="text-2xl font-semibold dark:text-white">Premium</h2>
        </div>
        <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/30 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold dark:text-white">Premium active</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">All features are unlocked.</p>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none px-4 py-1">
            Active subscription
          </Badge>
        </Card>
      </div>);

  }

  return (
    <div className="h-full overflow-y-auto pb-24 dark:bg-zinc-950">
      <div className="px-6 pt-8 pb-6 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </Button>
          <h1 className="text-xl font-semibold dark:text-white">Upgrade to Premium</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Unlock all features for $7.99/month.</p>
      </div>

      <AnimatePresence mode="wait">
        {showCheckout && clientSecret ?
        <motion.div
          key="checkout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="px-6 py-6">

            <Card className="p-6 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold dark:text-white">StackSense Premium</h3>
                  <p className="text-xs text-zinc-500">$7.99/month</p>
                </div>
              </div>
              <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#f59e0b',
                    borderRadius: '12px'
                  }
                }
              }}>

                <CheckoutForm
                onSuccess={handleSuccess}
                userId={userId}
                onCancel={() => {
                  setShowCheckout(false);
                  setClientSecret(null);
                }} />

              </Elements>
            </Card>
          </motion.div> :

        <motion.div
          key="pricing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-6 py-6 space-y-6">

            <div className="grid gap-4">
              <Card className="p-5 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">Free</h3>
                    <p className="text-zinc-500 text-sm">Basic tracking</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black dark:text-white">$0</p>
                    <p className="text-xs text-zinc-400">forever</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {FREE_FEATURES.slice(0, 4).map((f, i) =>
                <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-teal" />
                      <span className="dark:text-zinc-300 !whitespace-pre-line">{f.name}</span>
                    </div>
                )}
                </div>
                <Badge className="mt-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none">
                  Current Plan
                </Badge>
              </Card>

              <Card className="p-5 rounded-3xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium px-3 py-1 rounded-bl-xl">
                    Recommended
                  </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">Premium</h3>
                      <p className="text-zinc-500 text-sm">Full access</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black dark:text-white !whitespace-pre-line">$7.99</p>
                    <p className="text-xs text-zinc-400">per month</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                    {FREE_FEATURES.map((f, i) =>
                <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-amber-500" />
                        <span className="dark:text-zinc-300">
                          {f.name === "Up to 8 stack items" ? "Unlimited stack items" : f.name}
                        </span>
                      </div>
                )}
                </div>
                <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold h-12 shadow-lg shadow-amber-500/20">

                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </>
                }
                </Button>

                {isDevGrantEnabled && (
                  <Button
                    onClick={handleDevGrant}
                    disabled={devGrantLoading}
                    variant="outline"
                    className="w-full mt-3 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-950/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-bold h-10">
                    {devGrantLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Dev: Grant 1 month Premium'
                    )}
                  </Button>
                )}

              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-widest text-zinc-400 px-1">What's included</h3>
              <div className="grid gap-3">
                {PREMIUM_FEATURES.map((f, i) =>
              <Card key={i} className="p-4 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{f.name}</p>
                      <p className="text-xs text-zinc-500">{f.desc}</p>
                    </div>
                  </Card>
              )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure payments</span>
              </div>
              <span>|</span>
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}