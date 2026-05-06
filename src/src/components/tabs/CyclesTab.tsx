'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProtocolDashboard } from '@/components/protocols/ProtocolDashboard';
import { StartProtocolWizard } from '@/components/protocols/StartProtocolWizard';

export function CyclesTab({ onShowPricing }: { onShowPricing?: () => void }) {
  const [showBuilder, setShowBuilder] = useState(false);
                                                                      
  return (
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 pb-24 pt-[env(safe-area-inset-top,1rem)]">
            <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold dark:text-white">Protocols</h1>
                            <Button onClick={() => setShowBuilder(true)}>Start Protocol</Button>
                                  </div>
                                  
      <div className="px-6">
              <ProtocolDashboard onCreate={() => setShowBuilder(true)} />
                    </div>
                    
      {showBuilder ? (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4">
                                    <StartProtocolWizard onDone={() => setShowBuilder(false)} />
                                                <div className="mt-4 text-right">
                                                              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                                                                              Close
                                                                                            </Button>
                                                                                                        </div>
                                                                                                                  </div>
                                                                                                                          </div>
                                                                                                                                ) : null}
                                                                                                                                    </div>
                                                                                                                                      );
                                                                                                                                      }
                                                                                                                                      