"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Minus, Plus, Users, Percent, Receipt } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function TipCalculator() {
  const [mainAmount, setMainAmount] = useState(''); // Acts as Total in simple mode, Subtotal in tax mode
  const [tax, setTax] = useState('');
  const [isTaxMode, setIsTaxMode] = useState(false);
  
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState(1);
  const [activeTip, setActiveTip] = useState<'10' | '15' | '20' | 'custom'>('15');
  const [customTipMode, setCustomTipMode] = useState<'percent' | 'dollar'>('percent');

  const mainValue = useMemo(() => parseFloat(mainAmount) || 0, [mainAmount]);
  const taxValue = useMemo(() => parseFloat(tax) || 0, [tax]);

  const customTipValue = useMemo(() => {
    return parseFloat(customTip) || 0;
  }, [customTip]);

  // Tip Calculation
  const tipAmount = useMemo(() => {
    const baseAmount = mainValue; // Always tip on the main input (Total or Subtotal)

    if (activeTip === 'custom') {
      if (customTipMode === 'dollar') {
        return customTipValue;
      } else {
        return baseAmount * (customTipValue / 100);
      }
    }
    return baseAmount * (tipPercent / 100);
  }, [mainValue, tipPercent, customTipValue, activeTip, customTipMode]);

  // Total Calculation
  const totalAmount = useMemo(() => {
    if (isTaxMode) {
      return mainValue + taxValue + tipAmount;
    }
    return mainValue + tipAmount;
  }, [mainValue, taxValue, tipAmount, isTaxMode]);

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
      window.navigator.vibrate(50);
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
    setMainAmount('');
    setTax('');
    setTipPercent(15);
    setCustomTip('');
    setPeople(1);
    setActiveTip('15');
    // We don't reset isTaxMode as it's a preference
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
      <h1 className="text-xl font-extrabold text-center mb-3 font-headline text-foreground/80 tracking-widest uppercase">TipTally</h1>
      <Card className="bg-card rounded-2xl shadow-lg p-0 overflow-hidden w-full">
        <div className="flex flex-col">
          {/* Inputs */}
          <div className="p-4 space-y-5">
            
            {/* Bill Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="main-amount" className="text-sm text-muted-foreground font-semibold">
                  {isTaxMode ? 'Bill Subtotal' : 'Bill Total'}
                </Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="tax-mode" className="text-xs text-muted-foreground">Pre-tax Tip?</Label>
                  <Switch
                    id="tax-mode"
                    checked={isTaxMode}
                    onCheckedChange={(checked) => setIsTaxMode(checked)}
                  />
                </div>
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="main-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={mainAmount}
                  onChange={handleInputChange(setMainAmount)}
                  className="text-2xl font-bold text-left h-12 pl-10 rounded-md bg-input border-0 focus-visible:ring-primary focus-visible:ring-2"
                />
              </div>

              {isTaxMode && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="tax" className="text-xs text-muted-foreground font-semibold mb-1.5 block">Tax Amount</Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tax"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={tax}
                      onChange={handleInputChange(setTax)}
                      className="text-lg font-bold text-left h-10 pl-10 rounded-md bg-input border-0 focus-visible:ring-primary focus-visible:ring-2"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Separator />

            {/* Tip Selection */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-semibold">Select Tip</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleTipSelect(10, '10')} variant={activeTip === '10' ? 'default' : 'secondary'} className="h-10 text-sm font-bold">10%</Button>
                <Button onClick={() => handleTipSelect(15, '15')} variant={activeTip === '15' ? 'default' : 'secondary'} className="h-10 text-sm font-bold">15%</Button>
                <Button onClick={() => handleTipSelect(20, '20')} variant={activeTip === '20' ? 'default' : 'secondary'} className="h-10 text-sm font-bold">20%</Button>
                <div className="relative">
                    {customTipMode === 'dollar' ? (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                        placeholder={customTipMode === 'dollar' ? 'Amount ($)' : 'Percent (%)'}
                        type="text"
                        inputMode="decimal"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        aria-label="Custom tip"
                        className="text-sm font-bold text-center h-10 rounded-md bg-input border-0 focus-visible:ring-primary focus-visible:ring-2 pl-10"
                    />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-1">
                <Label htmlFor="custom-tip-mode" className="text-xs text-muted-foreground">Tip in $</Label>
                <Switch
                  id="custom-tip-mode"
                  checked={customTipMode === 'dollar'}
                  onCheckedChange={(checked) => setCustomTipMode(checked ? 'dollar' : 'percent')}
                />
              </div>
            </div>

            <Separator />

            {/* People Count */}
            <div className="space-y-2">
              <Label htmlFor="people" className="text-sm text-muted-foreground font-semibold">Number of People</Label>
              <div className="flex items-center justify-between bg-input h-12 rounded-md px-3">
                <Button variant="ghost" size="icon" onClick={() => handlePeopleChange(-1)} aria-label="Decrement number of people" className="text-primary hover:text-primary rounded-full h-8 w-8">
                  <Minus className="h-5 w-5" />
                </Button>
                <div className='flex items-center gap-2'>
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span id="people" className="text-xl font-bold tabular-nums">{people}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handlePeopleChange(1)} aria-label="Increment number of people" className="text-primary hover:text-primary rounded-full h-8 w-8">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Section (Inside Card) */}
          <div className="bg-primary text-primary-foreground flex flex-col p-5 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium opacity-90 text-center mb-2 uppercase tracking-wide">Per Person</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-primary-foreground/10 rounded-lg p-3 text-center backdrop-blur-sm">
                      <p className="text-xs font-semibold opacity-80 mb-1">Tip</p>
                      <p className="text-xl font-bold tracking-tight">{formatCurrency(tipPerPerson)}</p>
                   </div>
                   <div className="bg-primary-foreground/10 rounded-lg p-3 text-center backdrop-blur-sm">
                      <p className="text-xs font-semibold opacity-80 mb-1">Total</p>
                      <p className="text-xl font-bold tracking-tight">{formatCurrency(totalPerPerson)}</p>
                   </div>
                </div>
              </div>

              <div className="border-t border-primary-foreground/20 pt-3 space-y-1 px-1">
                <div className="flex items-center justify-between text-sm">
                    <p className="font-medium opacity-80">Total Tip</p>
                    <p className="font-bold">{formatCurrency(tipAmount)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <p className="font-medium opacity-80">Total Bill {isTaxMode && '(w/ Tax)'}</p>
                    <p className="font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>

            <Button
                variant="secondary"
                className="w-full mt-5 h-10 text-base font-bold bg-accent text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-accent/90 shadow-md"
                onClick={resetAll}
                disabled={mainValue === 0}>
                Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}