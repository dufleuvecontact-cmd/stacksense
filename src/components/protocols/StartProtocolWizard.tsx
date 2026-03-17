"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type ProtocolItem = {
  substance_name: string;
    dosage: string;
      timing: string;
      };
      
type WizardData = {
  name: string;
    goal: string;
      start_date: string;
        end_date: string;
          items: ProtocolItem[];
          };
          
export function StartProtocolWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
      const [data, setData] = useState<WizardData>({
          name: '',
              goal: '',
                  start_date: new Date().toISOString().slice(0, 10),
                      end_date: '',
                          items: [{ substance_name: '', dosage: '250mcg', timing: '08:00' }],
                            });
                            
  const nextStep = () => {
      if (step === 0) {
            if (!data.name) {
                    toast.error('Please provide a protocol name.');
                            return;
                                  }
                                      }
                                          setStep(step + 1);
                                            };
                                            
  const prevStep = () => {
      if (step > 0) { setStep(step - 1); }
        };
        
  const submitProtocol = async () => {
      setIsSubmitting(true);
          try {
                const response = await fetch('/api/protocols', {
                        method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data),
                                              });
                                                    const result = await response.json();
                                                          if (response.ok !== true) {
                                                                  const errorText = result.error ? result.error : 'Failed to create protocol';
                                                                          toast.error(errorText);
                                                                                  return;
                                                                                        }
                                                                                              toast.success('Protocol created successfully.');
                                                                                                    onDone();
                                                                                                        } catch (error) {
                                                                                                              console.error(error);
                                                                                                                    toast.error('Unable to create protocol.');
                                                                                                                        } finally {
                                                                                                                              setIsSubmitting(false);
                                                                                                                                  }
                                                                                                                                    };
                                                                                                                                    
  const addItem = () => {
      setData((prev) => ({
            ...prev,
                  items: [...prev.items, { substance_name: '', dosage: '250mcg', timing: '08:00' }],
                      }));
                        };
                        
  const maybeString = (value: string, fallback: string) => {
    if (value.length > 0) { return value; }
            };
            
  const renderStep = () => {
      if (step === 0) {
            return (
                    <div className="space-y-3">
                              <div>
                                          <Label>Protocol Name</Label>
                                                      <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                                                                </div>
                                                                          <div>
                                                                                      <Label>Goal</Label>
                                                                                                  <Textarea value={data.goal} onChange={(e) => setData({ ...data, goal: e.target.value })} rows={3} />
                                                                                                            </div>
                                                                                                                      <div className="grid grid-cols-2 gap-3">
                                                                                                                                  <div>
                                                                                                                                                <Label>Start Date</Label>
                                                                                                                                                              <Input type="date" value={data.start_date} onChange={(e) => setData({ ...data, start_date: e.target.value })} />
                                                                                                                                                                          </div>
                                                                                                                                                                                      <div>
                                                                                                                                                                                                    <Label>End Date (optional)</Label>
                                                                                                                                                                                                                  <Input type="date" value={data.end_date} onChange={(e) => setData({ ...data, end_date: e.target.value })} />
                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                          
    if (step === 1) {
          return (
                  <div className="space-y-3">
                            {data.items.map((item, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg">
                                                      <div className="grid grid-cols-3 gap-2">
                                                                      <Input value={item.substance_name} placeholder="Substance" onChange={(e) => {
                                                                                        const items = [...data.items];
                                                                                                          items[idx] = { ...items[idx], substance_name: e.target.value };
                                                                                                                            setData({ ...data, items });
                                                                                                                                            }} />
                                                                                                                                                            <Input value={item.dosage} placeholder="Dosage" onChange={(e) => {
                                                                                                                                                                              const items = [...data.items];
                                                                                                                                                                                                items[idx] = { ...items[idx], dosage: e.target.value };
                                                                                                                                                                                                                  setData({ ...data, items });
                                                                                                                                                                                                                                  }} />
                                                                                                                                                                                                                                                  <Input type="time" value={item.timing} onChange={(e) => {
                                                                                                                                                                                                                                                                    const items = [...data.items];
                                                                                                                                                                                                                                                                                      items[idx] = { ...items[idx], timing: e.target.value };
                                                                                                                                                                                                                                                                                                        setData({ ...data, items });
                                                                                                                                                                                                                                                                                                                        }} />
                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                            ))}
                                                                                                                                                                                                                                                                                                                                                                      <Button onClick={addItem}>Add substance</Button>
                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                        
    if (step === 2) {
          return (
                  <div className="space-y-3">
                            <p className="text-sm">Schedule Review</p>
                                      {data.items.map((item, idx) => (
                                                  <div key={idx} className="border rounded p-2">
                                                                <p className="font-medium">{maybeString(item.substance_name, 'Untitled')}: {item.dosage} @ {item.timing}</p>
                                                                            </div>
                                                                                      ))}
                                                                                              </div>
                                                                                                    );
                                                                                                        }
                                                                                                        
    return (
          <div className="space-y-2">
                  <p><strong>Title:</strong> {data.name}</p>
                          <p><strong>Goal:</strong> {maybeString(data.goal, 'N/A')}</p>
                                  <p><strong>Dates:</strong> {data.start_date} to {maybeString(data.end_date, 'ongoing')}</p>
                                          <p><strong>Items:</strong></p>
                                                  <ul className="list-disc pl-5">
                                                            {data.items.map((item, idx) => (
                                                                        <li key={idx}>{maybeString(item.substance_name, 'Untitled')} - {item.dosage} @ {item.timing}</li>
                                                                                  ))}
                                                                                          </ul>
                                                                                                </div>
                                                                                                    );
                                                                                                      };
                                                                                                      
  return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5">
            <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Protocol Builder</h2>
                            <span className="text-xs text-zinc-400">Step {step + 1}/4</span>
                                  </div>
                                  
      {renderStep()}
      
      <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={prevStep} disabled={step === 0}>Back</Button>
                      {step < 3 ? (
                                <Button onClick={nextStep}>Next</Button>
                                        ) : (
                                                  <Button onClick={submitProtocol} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Finish & Create'}</Button>
                                                          )}
                                                                </div>
                                                                    </div>
                                                                      );
                                                                      }
                                                                      