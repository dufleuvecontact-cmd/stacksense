"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ProtocolSummary = {
  id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  protocol_items: any[];
  protocol_stats_snapshots: any[];
};

export function ProtocolDashboard({ onCreate }: { onCreate?: () => void }) {
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/protocols');
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to load protocols');
        return;
      }
      setProtocols(json.protocols ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load protocols');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProtocols(); }, []);

  const handlePause = async (id: string) => {
    const res = await fetch(`/api/protocols/${id}/pause`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || 'Pause failed');
      return;
    }
    fetchProtocols();
  };

  const handleResume = async (id: string) => {
    const res = await fetch(`/api/protocols/${id}/resume`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || 'Resume failed');
      return;
    }
    fetchProtocols();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Protocols</h2>
        {onCreate && <Button onClick={onCreate}>Create Protocol</Button>}
      </div>

      {loading && <p>Loading...</p>}

      {protocols.length === 0 && !loading && <p>No protocols yet. Start one!</p>}

      <div className="space-y-3">
        {protocols.map((protocol) => {
          const latest = protocol.protocol_stats_snapshots?.[0];
          const adherence = latest?.adherence_percent ?? 0;
          const daysActive = Math.max(1, Math.floor((new Date().getTime() - new Date(protocol.start_date).getTime()) / (1000 * 60 * 60 * 24)));
          const nextDose = '';

          return (
            <Card key={protocol.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">{protocol.name}</h3>
                  <p className="text-xs text-zinc-500">{protocol.goal ?? 'No goal provided'}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Adherence {adherence}%</p>
                  <p>{daysActive}d active</p>
                  <p>{protocol.protocol_items.length} substances</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2 text-xs">
                <Button size="sm" onClick={() => router.push(`/protocols/${protocol.id}`)}>Open</Button>
                {protocol.is_active ? (
                  <Button size="sm" variant="outline" onClick={() => handlePause(protocol.id)}>Pause</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleResume(protocol.id)}>Resume</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
