"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Minus, Plus, Users, Percent } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState(1);
  const [activeTip, setActiveTip] = useState<'10' | '15' | '20' | 'custom'>('15');
  const [customTipMode, setCustomTipMode] = useState<'percent' | 'dollar'>('percent');

  const billAmount = useMemo(() => parseFloat(bill) || 0, [bill]);

  const customTipValue = useMemo(() => {
    return parseFloat(customTip) || 0;
  }, [customTip]);

  const tipAmount = useMemo(() => {
    if (activeTip === 'custom') {
      if (customTipMode === 'dollar') {
        return customTipValue;
      } else {
        return billAmount * (customTipValue / 100);
      }
    }
    return billAmount * (tipPercent / 100);
  }, [billAmount, tipPercent, customTipValue, activeTip, customTipMode]);

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

  const triggerHapticFeedback = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  const handleTipSelect = (percent: number, type: '10' | '15' | '20') => {
    triggerHapticFeedback();
    setTipPercent(percent);
    setActiveTip(type);
    setCustomTip('');
  };

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const decimalParts = sanitizedValue.split('.');
    if (decimalParts.length > 2) {
      return;
    }
    setter(sanitizedValue);
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(setCustomTip)(e);
    setTipPercent(0);
    setActiveTip('custom');
  };

  const handlePeopleChange = (change: number) => {
    triggerHapticFeedback();
    setPeople(p => Math.max(1, p + change));
  };

  const resetAll = () => {
    triggerHapticFeedback();
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
    <div className="w-full max-w-md mx-auto font-sans">
      <h1 className="text-2xl font-extrabold text-center mb-4 font-headline text-foreground/80 tracking-widest uppercase">TipTally</h1>
      <Card className="bg-card rounded-2xl shadow-lg p-0 overflow-hidden w-full">
        <div className="flex flex-col">
          {/* Inputs */}
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="bill" className="text-sm text-muted-foreground font-semibold">Bill</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="bill"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={bill}
                  onChange={handleInputChange(setBill)}
                  className="text-3xl font-bold text-left h-14 pl-10 rounded-md bg-input border-0 focus-visible:ring-primary focus-visible:ring-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-semibold">Select Tip</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleTipSelect(10, '10')} variant={activeTip === '10' ? 'default' : 'secondary'} className="h-10 text-base font-bold">10%</Button>
                <Button onClick={() => handleTipSelect(15, '15')} variant={activeTip === '15' ? 'default' : 'secondary'} className="h-10 text-base font-bold">15%</Button>
                <Button onClick={() => handleTipSelect(20, '20')} variant={activeTip === '20' ? 'default' : 'secondary'} className="h-10 text-base font-bold">20%</Button>
                <div className="relative">
                    {customTipMode === 'dollar' ? (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input 
                        placeholder="Custom" 
                        type="text"
                        inputMode="decimal"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        aria-label="Custom tip"
                        className="text-base font-bold text-center h-10 rounded-md bg-input border-0 focus-visible:ring-primary focus-visible:ring-2 pl-10"
                    />
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <Label htmlFor="custom-tip-mode" className="text-sm text-muted-foreground">Tip in $</Label>
                <Switch
                  id="custom-tip-mode"
                  checked={customTipMode === 'dollar'}
                  onCheckedChange={(checked) => setCustomTipMode(checked ? 'dollar' : 'percent')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="people" className="text-sm text-muted-foreground font-semibold">Number of People</Label>
              <div className="flex items-center justify-between bg-input h-11 rounded-md px-3">
                <Button variant="ghost" size="icon" onClick={() => handlePeopleChange(-1)} aria-label="Decrement number of people" className="text-primary hover:text-primary rounded-full">
                  <Minus className="h-4 w-4" />
                </Button>
                <div className='flex items-center gap-2'>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span id="people" className="text-xl font-bold tabular-nums">{people}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handlePeopleChange(1)} aria-label="Increment number of people" className="text-primary hover:text-primary rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-primary text-primary-foreground flex flex-col justify-between p-4 rounded-t-2xl mt-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">Tip / Person</p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">{formatCurrency(tipPerPerson)}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">Total / Person</p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">{formatCurrency(totalPerPerson)}</p>
              </div>

              <div className="border-t border-primary-foreground/20 pt-3 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                      <p>Total Bill</p>
                      <p className="text-xl">{formatCurrency(totalAmount)}</p>
                  </div>
              </div>
            </div>

            <Button 
                variant="secondary" 
                className="w-full mt-4 h-11 text-lg font-bold bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-100 hover:bg-accent/90 focus-visible:bg-accent/90"
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
