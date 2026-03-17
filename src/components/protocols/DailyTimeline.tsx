"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ProtocolLibrary } from '@/components/ProtocolLibrary';
import { StartProtocolWizard } from '@/components/protocols/StartProtocolWizard';

type DoseOccurrenceItem = {
  id: string;
    scheduled_at: string;
      status: string;
        protocol_item_id: any;
          protocol_id: any;
          };
          
export function DailyTimeline({ date }: { date: string }) {
  const [doses, setDoses] = useState<DoseOccurrenceItem[]>([]);
    const [loading, setLoading] = useState(false);
      const [showLibrary, setShowLibrary] = useState(false);
        const [showWizard, setShowWizard] = useState(false);
        
  const loadDoses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doses?date=${date}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Could not fetch doses');
        setDoses([]);
      } else {
        setDoses(json.doses ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch doses');
      setDoses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      loadDoses();
        }, [date]);
        
  if (loading) return <p>Loading timeline...</p>;
  
  return (
      <div className="space-y-4">
            <div className="flex items-center justify-between">
                    <div>
                              <h3 className="text-sm font-semibold">Daily Timeline</h3>
                                        <p className="text-xs text-zinc-500">{date}</p>
                                                </div>
                                                        <div className="flex gap-2">
                                                                  <Button size="sm" onClick={() => setShowLibrary(true)} variant="outline">Browse Library</Button>
                                                                            <Button size="sm" onClick={() => setShowWizard(true)}>Start Protocol</Button>
                                                                                    </div>
                                                                                          </div>
                                                                                          
      {doses.length === 0 ? (
              <p className="text-sm text-zinc-500">No scheduled doses for {date}. Start a protocol from library or builder.</p>
                    ) : (
                            <div className="space-y-2">
                                      {doses.map((dose) => (
                                                  <div key={dose.id} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                                                <p className="font-medium">{new Date(dose.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                              <p className="text-xs text-zinc-500">{dose.protocol_item_id?.name ?? 'Substance'}  {dose.status}</p>
                                                                                          </div>
                                                                                                    ))}
                                                                                                            </div>
                                                                                                                  )}
                                                                                                                  
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xl">
            <ProtocolLibrary onClose={() => setShowLibrary(false)} />
          </div>
        </div>
      )}
                                                            
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-4">
            <div className="mb-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowWizard(false)}>Close</Button>
            </div>
            <StartProtocolWizard onDone={() => setShowWizard(false)} />
          </div>
        </div>
      )}
                                                                                                      </div>
                                                                                                        );
                                                                                                        }
                                                                                                        