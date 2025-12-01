// Pricing Page - Beautiful pricing tiers for SkillEngine

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  Star,
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
  comingSoon?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out SkillEngine',
    icon: Sparkles,
    color: 'text-gray-400',
    features: [
      { text: 'All Job Search Skills', included: true },
      { text: '5 AI generations per day', included: true },
      { text: 'Basic Role Templates', included: true },
      { text: 'Community Skills Access', included: true },
      { text: 'Dashboard & History', included: true },
      { text: 'Custom Skill Creation', included: false },
      { text: 'Batch Processing', included: false },
      { text: 'Priority Support', included: false },
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious job seekers and professionals',
    icon: Zap,
    color: 'text-blue-500',
    popular: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI generations', included: true },
      { text: 'All Role Templates (10+)', included: true },
      { text: 'Custom Skill Creation', included: true },
      { text: 'Batch Processing (CSV)', included: true },
      { text: 'Export Skills as JSON', included: true },
      { text: 'Priority Support', included: true },
      { text: 'API Access', included: false },
    ],
    cta: 'Start Pro Trial',
    comingSoon: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: 'per month',
    description: 'For teams and organizations',
    icon: Crown,
    color: 'text-purple-500',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 10 team members', included: true },
      { text: 'Shared Skill Library', included: true },
      { text: 'Team Analytics', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'SSO Integration', included: true },
      { text: 'API Access', included: true },
      { text: 'Dedicated Support', included: true },
    ],
    cta: 'Contact Sales',
    comingSoon: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations with custom needs',
    icon: Building2,
    color: 'text-orange-500',
    features: [
      { text: 'Everything in Team', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom Integrations', included: true },
      { text: 'On-premise Deployment', included: true },
      { text: 'Custom Model Training', included: true },
      { text: 'SLA Guarantee', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'Security Review', included: true },
    ],
    cta: 'Contact Sales',
    comingSoon: true,
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include access to our core AI-powered job search tools.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              billingPeriod === 'annual' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={billingPeriod === 'annual' ? 'font-semibold' : 'text-muted-foreground'}>
            Annual
            <span className="ml-2 text-xs text-green-500 font-semibold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {PRICING_TIERS.map((tier) => {
          const Icon = tier.icon;
          const annualPrice = tier.price.startsWith('$')
            ? `$${Math.round(parseInt(tier.price.slice(1)) * 0.8 * 12)}`
            : tier.price;

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-card p-6 flex flex-col ${
                tier.popular ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              {tier.comingSoon && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-500/10 text-yellow-600 text-xs font-semibold px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tier.color.replace('text-', 'from-')}/20 to-transparent flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${tier.color}`} />
                </div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {billingPeriod === 'annual' && tier.price.startsWith('$')
                    ? annualPrice
                    : tier.price}
                </span>
                <span className="text-muted-foreground ml-2">
                  {billingPeriod === 'annual' && tier.price.startsWith('$')
                    ? '/year'
                    : `/${tier.period}`}
                </span>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.popular ? 'default' : 'outline'}
                disabled={tier.comingSoon}
                onClick={() => {
                  if (tier.name === 'Free') {
                    navigate('/skills');
                  }
                }}
              >
                {tier.cta}
                {!tier.comingSoon && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Do I need to provide my own API keys?</h3>
            <p className="text-muted-foreground">
              Yes! SkillEngine uses your own Gemini or Claude API keys. This keeps costs transparent and gives you full control. Both providers offer generous free tiers.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Absolutely. No long-term contracts. Cancel your subscription anytime and keep using the free tier.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">What's included in the free tier?</h3>
            <p className="text-muted-foreground">
              The free tier includes all core job search skills (resume optimization, interview prep, cover letters, etc.), basic role templates, and full access to community skills.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">How does batch processing work?</h3>
            <p className="text-muted-foreground">
              Upload a CSV of job descriptions and run any skill across all of them at once. Perfect for applying to multiple jobs efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to supercharge your job search?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of job seekers using AI to land their dream jobs faster.
          </p>
          <Button size="lg" onClick={() => navigate('/skills')}>
            <Sparkles className="h-5 w-5 mr-2" />
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
