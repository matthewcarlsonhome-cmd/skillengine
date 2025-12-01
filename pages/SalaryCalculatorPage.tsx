// Salary Negotiation Calculator - Calculate salary ranges and compare offers

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import {
  DollarSign,
  Calculator,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Briefcase,
  PieChart,
  Plus,
  Trash2,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface Offer {
  id: string;
  company: string;
  baseSalary: number;
  bonus: number;
  equity: number;
  benefits: number;
  signingBonus: number;
  pto: number;
  remote: 'full' | 'hybrid' | 'office';
}

const COST_OF_LIVING: Record<string, number> = {
  'San Francisco': 1.35,
  'New York': 1.30,
  'Seattle': 1.20,
  'Austin': 1.0,
  'Denver': 1.05,
  'Chicago': 1.0,
  'Boston': 1.15,
  'Los Angeles': 1.25,
  'Miami': 1.05,
  'Remote': 0.95,
  'Other': 1.0,
};

const SalaryCalculatorPage: React.FC = () => {
  const { addToast } = useToast();

  // Current Salary State
  const [currentSalary, setCurrentSalary] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('Other');
  const [targetLocation, setTargetLocation] = useState<string>('Other');
  const [yearsExperience, setYearsExperience] = useState<string>('');

  // Offer Comparison
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    company: '',
    baseSalary: 0,
    bonus: 0,
    equity: 0,
    benefits: 0,
    signingBonus: 0,
    pto: 15,
    remote: 'hybrid',
  });

  // Calculate adjusted salary based on cost of living
  const calculateAdjustedSalary = () => {
    const salary = parseFloat(currentSalary) || 0;
    const currentCOL = COST_OF_LIVING[currentLocation] || 1;
    const targetCOL = COST_OF_LIVING[targetLocation] || 1;
    const adjusted = (salary / currentCOL) * targetCOL;
    return Math.round(adjusted);
  };

  // Calculate total compensation for an offer
  const calculateTotalComp = (offer: Offer) => {
    return offer.baseSalary + offer.bonus + offer.equity + offer.benefits + (offer.signingBonus / 4);
  };

  // Calculate salary range based on experience
  const calculateSalaryRange = () => {
    const base = parseFloat(currentSalary) || 0;
    const years = parseInt(yearsExperience) || 0;

    // Rule of thumb: 10-15% increase for job change
    const minIncrease = 0.10;
    const maxIncrease = 0.25 + (years * 0.01); // More exp = higher potential

    return {
      min: Math.round(base * (1 + minIncrease)),
      target: Math.round(base * (1 + (minIncrease + maxIncrease) / 2)),
      max: Math.round(base * (1 + maxIncrease)),
    };
  };

  const addOffer = () => {
    if (!newOffer.company || !newOffer.baseSalary) {
      addToast('Company and base salary are required', 'error');
      return;
    }

    const offer: Offer = {
      id: crypto.randomUUID(),
      company: newOffer.company || '',
      baseSalary: newOffer.baseSalary || 0,
      bonus: newOffer.bonus || 0,
      equity: newOffer.equity || 0,
      benefits: newOffer.benefits || 0,
      signingBonus: newOffer.signingBonus || 0,
      pto: newOffer.pto || 15,
      remote: newOffer.remote || 'hybrid',
    };

    setOffers([...offers, offer]);
    setNewOffer({
      company: '',
      baseSalary: 0,
      bonus: 0,
      equity: 0,
      benefits: 0,
      signingBonus: 0,
      pto: 15,
      remote: 'hybrid',
    });
    setShowAddOffer(false);
    addToast('Offer added', 'success');
  };

  const removeOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
  };

  const range = calculateSalaryRange();
  const adjustedSalary = calculateAdjustedSalary();
  const sortedOffers = [...offers].sort((a, b) => calculateTotalComp(b) - calculateTotalComp(a));
  const bestOffer = sortedOffers[0];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
          <Calculator className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Salary Calculator</h1>
          <p className="text-muted-foreground">Calculate your worth and compare offers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Salary Analysis */}
        <div className="space-y-6">
          {/* Current Salary */}
          <div className="border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Current Compensation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Current Base Salary</label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Years of Experience</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Current Location</label>
                  <select
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-background"
                  >
                    {Object.keys(COST_OF_LIVING).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Target Location</label>
                  <select
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-background"
                  >
                    {Object.keys(COST_OF_LIVING).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Range Recommendation */}
          {currentSalary && (
            <div className="border rounded-xl p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recommended Ask Range
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                  <p className="text-xl font-bold text-yellow-500">
                    ${range.min.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border-2 border-green-500">
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="text-xl font-bold text-green-500">
                    ${range.target.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground mb-1">Stretch</p>
                  <p className="text-xl font-bold text-blue-500">
                    ${range.max.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on a typical 10-25% increase for a job change plus experience premium.
              </p>
            </div>
          )}

          {/* Cost of Living Adjustment */}
          {currentSalary && currentLocation !== targetLocation && (
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Cost of Living Adjustment
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{currentLocation}</p>
                  <p className="text-xl font-bold">${parseInt(currentSalary).toLocaleString()}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{targetLocation}</p>
                  <p className="text-xl font-bold text-primary">${adjustedSalary.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {adjustedSalary > parseInt(currentSalary)
                  ? `You'll need ~$${(adjustedSalary - parseInt(currentSalary)).toLocaleString()} more to maintain your lifestyle.`
                  : `Your purchasing power increases by ~$${(parseInt(currentSalary) - adjustedSalary).toLocaleString()}.`}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Offer Comparison */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                Compare Offers
              </h2>
              <Button size="sm" onClick={() => setShowAddOffer(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Offer
              </Button>
            </div>

            {/* Add Offer Form */}
            {showAddOffer && (
              <div className="border rounded-lg p-4 mb-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Company"
                    value={newOffer.company}
                    onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Base Salary"
                    value={newOffer.baseSalary || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, baseSalary: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Annual Bonus"
                    value={newOffer.bonus || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, bonus: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Annual Equity (vested)"
                    value={newOffer.equity || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, equity: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Signing Bonus"
                    value={newOffer.signingBonus || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, signingBonus: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Benefits Value"
                    value={newOffer.benefits || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, benefits: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={addOffer}>Add</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddOffer(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Add offers to compare them side by side</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOffers.map((offer, index) => {
                  const totalComp = calculateTotalComp(offer);
                  const isBest = index === 0 && offers.length > 1;

                  return (
                    <div
                      key={offer.id}
                      className={`border rounded-lg p-4 ${isBest ? 'border-green-500 bg-green-500/5' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isBest && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          <h3 className="font-semibold">{offer.company}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOffer(offer.id)}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base:</span>
                          <span>${offer.baseSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bonus:</span>
                          <span>${offer.bonus.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equity:</span>
                          <span>${offer.equity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Signing:</span>
                          <span>${offer.signingBonus.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between font-semibold">
                        <span>Total Comp:</span>
                        <span className={isBest ? 'text-green-500' : ''}>
                          ${totalComp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="border rounded-xl p-6 bg-blue-500/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Negotiation Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Always negotiate - most employers expect it</li>
              <li>• Get the offer in writing before negotiating</li>
              <li>• Consider total compensation, not just base</li>
              <li>• Don't give your current salary first</li>
              <li>• Research market rates on Levels.fyi, Glassdoor</li>
              <li>• Be prepared to walk away if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculatorPage;
