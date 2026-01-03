"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Minus, Plus, Users, Percent, Receipt } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TipCalculator() {
  const [mainAmount, setMainAmount] = useState(''); // Acts as Total in simple mode, Subtotal in tax mode
  const [tax, setTax] = useState('');
  const [isTaxMode, setIsTaxMode] = useState(false);
  
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState(1);
  const [activeTip, setActiveTip] = useState<'10' | '15' | '20' | 'custom'>('15');
  const [customTipMode, setCustomTipMode] = useState<'percent' | 'dollar'>('percent');
  const [valueUpdateKey, setValueUpdateKey] = useState(0);

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

  // Trigger animation when values change
  useEffect(() => {
    if (mainValue > 0) {
      setValueUpdateKey(prev => prev + 1);
    }
  }, [tipAmount, totalAmount, tipPerPerson, totalPerPerson, mainValue]);

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
    <div className="w-full max-w-md mx-auto font-sans relative">
      <div className="absolute -top-2 right-0 z-10">
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-extrabold text-center mb-4 font-headline text-foreground tracking-widest uppercase bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">TipTally</h1>
      <Card className="bg-card rounded-2xl shadow-xl p-0 overflow-hidden w-full border border-border/50">
        <div className="flex flex-col">
          {/* Inputs */}
          <div className="p-5 space-y-6">
            
            {/* Bill Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="main-amount" className="text-sm text-foreground/70 font-semibold">
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
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 z-10" />
                <Input
                  id="main-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={mainAmount}
                  onChange={handleInputChange(setMainAmount)}
                  className="text-3xl font-bold text-left h-14 pl-11 rounded-lg bg-input/80 border border-input focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 transition-all"
                />
              </div>

              {isTaxMode && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="tax" className="text-xs text-foreground/70 font-semibold mb-1.5 block">Tax Amount</Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 z-10" />
                    <Input
                      id="tax"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={tax}
                      onChange={handleInputChange(setTax)}
                      className="text-lg font-bold text-left h-11 pl-10 rounded-lg bg-input/80 border border-input focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Separator />

            {/* Tip Selection */}
            <div className="space-y-3">
              <Label className="text-sm text-foreground/70 font-semibold">Select Tip</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleTipSelect(10, '10')} 
                  variant={activeTip === '10' ? 'default' : 'secondary'} 
                  className={`h-12 text-sm font-bold transition-all duration-200 ${
                    activeTip === '10' 
                      ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 scale-105' 
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  10%
                </Button>
                <Button 
                  onClick={() => handleTipSelect(15, '15')} 
                  variant={activeTip === '15' ? 'default' : 'secondary'} 
                  className={`h-12 text-sm font-bold transition-all duration-200 ${
                    activeTip === '15' 
                      ? 'bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/20 scale-105 text-accent-foreground' 
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  15%
                </Button>
                <Button 
                  onClick={() => handleTipSelect(20, '20')} 
                  variant={activeTip === '20' ? 'default' : 'secondary'} 
                  className={`h-12 text-sm font-bold transition-all duration-200 ${
                    activeTip === '20' 
                      ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 scale-105' 
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  20%
                </Button>
                <div className="relative">
                    {customTipMode === 'dollar' ? (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    ) : (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    )}
                    <Input
                        placeholder={customTipMode === 'dollar' ? 'Amount ($)' : 'Percent (%)'}
                        type="text"
                        inputMode="decimal"
                        value={customTip}
                        onChange={handleCustomTipChange}
                        aria-label="Custom tip"
                        className={`text-sm font-bold text-center h-12 rounded-lg bg-input/80 border transition-all ${
                          activeTip === 'custom' 
                            ? 'border-primary ring-2 ring-primary ring-offset-0 bg-primary/5' 
                            : 'border-input focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0'
                        } pl-10`}
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
            <div className="space-y-3">
              <Label htmlFor="people" className="text-sm text-foreground/70 font-semibold">Number of People</Label>
              <div className="flex items-center justify-between bg-input/80 border border-input h-14 rounded-lg px-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handlePeopleChange(-1)} 
                  aria-label="Decrement number of people" 
                  className="text-primary hover:text-primary hover:bg-primary/10 rounded-full h-9 w-9 transition-all active:scale-90"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className='flex items-center gap-2.5'>
                  <Users className="h-5 w-5 text-primary/70" />
                  <span id="people" className="text-2xl font-bold tabular-nums text-foreground">{people}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handlePeopleChange(1)} 
                  aria-label="Increment number of people" 
                  className="text-primary hover:text-primary hover:bg-primary/10 rounded-full h-9 w-9 transition-all active:scale-90"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Section (Inside Card) */}
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground flex flex-col p-6 rounded-t-3xl shadow-[0_-8px_25px_rgba(0,0,0,0.15)] relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 pointer-events-none" />
            
            <div className="space-y-7 relative z-10">
              {/* Per Person Grid */}
              <div>
                <p className="text-sm font-semibold opacity-95 text-center mb-3 uppercase tracking-wider">Per Person</p>
                <div className="grid grid-cols-2 gap-3">
                   <div 
                     key={`tip-per-person-${valueUpdateKey}`}
                     className="bg-primary-foreground/15 rounded-xl p-4 text-center backdrop-blur-sm border border-primary-foreground/20 shadow-lg animate-value-update"
                   >
                      <p className="text-xs font-semibold opacity-90 mb-1.5">Tip</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(tipPerPerson)}</p>
                   </div>
                   <div 
                     key={`total-per-person-${valueUpdateKey}`}
                     className="bg-primary-foreground/15 rounded-xl p-4 text-center backdrop-blur-sm border border-primary-foreground/20 shadow-lg animate-value-update"
                   >
                      <p className="text-xs font-semibold opacity-90 mb-1.5">Total</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalPerPerson)}</p>
                   </div>
                </div>
              </div>

              {/* Totals Grid */}
              <div>
                <p className="text-sm font-semibold opacity-95 text-center mb-3 uppercase tracking-wider">Totals</p>
                <div className="grid grid-cols-2 gap-3">
                   <div 
                     key={`total-tip-${valueUpdateKey}`}
                     className="bg-primary-foreground/15 rounded-xl p-4 text-center backdrop-blur-sm border border-primary-foreground/20 shadow-lg animate-value-update"
                   >
                      <p className="text-xs font-semibold opacity-90 mb-1.5">Total Tip</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(tipAmount)}</p>
                   </div>
                   <div 
                     key={`total-bill-${valueUpdateKey}`}
                     className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-4 text-center backdrop-blur-sm border-2 border-accent/30 shadow-lg animate-value-update"
                   >
                      <p className="text-xs font-semibold opacity-90 mb-1.5">Total Bill</p>
                      <p className="text-2xl font-bold tracking-tight text-accent-foreground">{formatCurrency(totalAmount)}</p>
                   </div>
                </div>
              </div>
            </div>

            <Button
                variant="secondary"
                className="w-full mt-7 h-14 text-lg font-bold bg-gradient-to-r from-accent to-accent/90 text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-accent/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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