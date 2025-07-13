"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Minus, Plus, Users } from 'lucide-react';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState(1);
  const [activeTip, setActiveTip] = useState<'10' | '15' | '20' | 'custom'>('15');

  const billAmount = useMemo(() => parseFloat(bill) || 0, [bill]);
  
  const customTipValue = useMemo(() => {
    // Treat custom tip as a direct dollar amount
    return parseFloat(customTip) || 0;
  }, [customTip]);

  const tipAmount = useMemo(() => {
    if (activeTip === 'custom') {
      return customTipValue;
    }
    return billAmount * (tipPercent / 100);
  }, [billAmount, tipPercent, customTipValue, activeTip]);

  const totalAmount = useMemo(() => {
    return billAmount + tipAmount;
  }, [billAmount, tipAmount]);

  const tipPerPerson = useMemo(() => {
    if (people < 1) return 0;
    return tipAmount / people;
  }, [tipAmount, people]);

  const totalPerPerson = useMemo(() => {
    if (people < 1) return 0;
    return totalAmount / people;
  }, [totalAmount, people]);

  const handleTipSelect = (percent: number, type: '10' | '15' | '20') => {
    setTipPercent(percent);
    setActiveTip(type);
    setCustomTip('');
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomTip(value);
    setTipPercent(0);
    setActiveTip('custom');
  };
  
  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setBill(value);
  };

  const resetAll = () => {
    setBill('');
    setTipPercent(15);
    setCustomTip('');
    setPeople(1);
    setActiveTip('15');
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="w-full max-w-lg mx-auto font-body">
      <h1 className="text-3xl font-extrabold text-center mb-6 font-headline text-foreground/80 tracking-widest uppercase">TipTally</h1>
      <Card className="bg-card rounded-3xl shadow-2xl p-0 overflow-hidden w-full">
        <div className="flex flex-col">
          {/* Inputs */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bill" className="text-md text-muted-foreground font-semibold">Bill</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  id="bill"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={bill}
                  onChange={handleBillChange}
                  className="text-4xl font-bold text-left h-16 pl-14 rounded-lg bg-input border-0 focus-visible:ring-primary focus-visible:ring-2"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-md text-muted-foreground font-semibold">Select Tip</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleTipSelect(10, '10')} variant={activeTip === '10' ? 'default' : 'secondary'} className="h-11 text-lg font-bold">10%</Button>
                <Button onClick={() => handleTipSelect(15, '15')} variant={activeTip === '15' ? 'default' : 'secondary'} className="h-11 text-lg font-bold">15%</Button>
                <Button onClick={() => handleTipSelect(20, '20')} variant={activeTip === '20' ? 'default' : 'secondary'} className="h-11 text-lg font-bold">20%</Button>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Custom" 
                        type="text"
                        inputMode="decimal"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        className="text-lg font-bold text-center h-11 rounded-lg bg-input border-0 focus-visible:ring-primary focus-visible:ring-2 pl-12"
                    />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="people" className="text-md text-muted-foreground font-semibold">Number of People</Label>
              <div className="flex items-center justify-between bg-input h-12 rounded-lg px-4">
                <Button variant="ghost" size="icon" onClick={() => setPeople(p => Math.max(1, p - 1))} aria-label="Decrement number of people" className="text-primary hover:text-primary rounded-full">
                  <Minus className="h-5 w-5" />
                </Button>
                <div className='flex items-center gap-2'>
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span id="people" className="text-2xl font-bold tabular-nums">{people}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPeople(p => p + 1)} aria-label="Increment number of people" className="text-primary hover:text-primary rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-primary text-primary-foreground flex flex-col justify-between p-6 rounded-t-3xl mt-2">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Tip / Person</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">{formatCurrency(tipPerPerson)}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Total / Person</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">{formatCurrency(totalPerPerson)}</p>
              </div>

              <div className="border-t border-primary-foreground/20 pt-5 space-y-4">
                  <div className="flex items-center justify-between font-bold">
                      <p>Total Bill</p>
                      <p className="text-2xl">{formatCurrency(totalAmount)}</p>
                  </div>
              </div>
            </div>

            <Button 
                variant="secondary" 
                className="w-full mt-6 h-12 text-xl font-bold bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-100 hover:bg-accent/90 focus-visible:bg-accent/90"
                onClick={resetAll}
                disabled={billAmount === 0}>
                Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
