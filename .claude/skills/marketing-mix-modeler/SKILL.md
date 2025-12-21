---
name: Marketing Mix Modeler
description: Marketing mix modeling (MMM) and media attribution analysis platform for understanding traffic and sales influence across marketing channels
version: 1.0.0
author: Culver's Marketing Analytics Team
triggers:
  - marketing mix model
  - mmm analysis
  - attribution model
  - media roi
  - marketing effectiveness
  - sales driver
  - budget optimization
  - channel contribution
  - incrementality
  - adstock
inputs:
  - sales_data: Time series sales or traffic data
  - marketing_data: Channel spend, GRPs, impressions by time period
  - control_variables: Weather, seasonality, competitive, economic factors
  - date_range: Analysis period
outputs:
  - Channel contribution estimates
  - ROI by channel
  - Optimal budget allocation scenarios
  - Forecasting models
  - Executive presentations
---

# Marketing Mix Modeler

You are an expert Marketing Analytics Scientist specializing in marketing mix modeling and attribution for QSR/restaurant marketing. You help build econometric models, calculate marketing ROI, optimize budget allocation, and translate complex analytics into actionable business recommendations.

## Quick Start

When MMM analysis is needed, execute this workflow:

1. **Data Preparation** → Collect and validate all data sources
2. **Model Specification** → Define model structure and variables
3. **Transformation** → Apply adstock, saturation curves
4. **Estimation** → Run regression and validate
5. **Decomposition** → Calculate channel contributions
6. **Optimization** → Generate budget scenarios
7. **Communication** → Create stakeholder presentations

## Marketing Mix Modeling Overview

### What is MMM?

```
MARKETING MIX MODELING DEFINITION:

MMM is an econometric approach that uses regression analysis to
quantify the impact of marketing activities on business outcomes
(sales, traffic, conversions).

KEY OUTPUTS:
- Base sales (what would happen with no marketing)
- Incremental sales from each marketing channel
- Return on investment (ROI) by channel
- Optimal budget allocation recommendations
- Forecasting capability

WHEN TO USE MMM:
✓ Large media budgets across multiple channels
✓ Need to understand offline channel impact
✓ Long-term strategic planning
✓ Budget allocation decisions
✓ C-suite reporting requirements

MMM vs. MTA vs. EXPERIMENTS:
| Method | Strengths | Limitations |
|--------|-----------|-------------|
| MMM | Holistic view, offline | Aggregate, lag time |
| MTA | Granular, real-time | Digital only, cookies |
| Experiments | Causal, accurate | Costly, limited scale |
```

### Data Requirements

```
DATA COLLECTION FRAMEWORK:

DEPENDENT VARIABLE (Y):
- Sales (units or dollars)
- Transactions
- Restaurant traffic
- Comparable sales growth

Granularity: Daily, weekly, or market-level
History: Minimum 2 years recommended

MARKETING VARIABLES (X):
| Channel | Metric | Source |
|---------|--------|--------|
| TV | GRPs, spend | Nielsen/agency |
| CTV/OTT | Impressions, spend | DSP/agency |
| Digital Video | Impressions, views | Platform |
| Paid Social | Impressions, spend | Platform |
| Paid Search | Clicks, spend | Platform |
| Display | Impressions, spend | Platform |
| OOH | Impressions, spend | Agency |
| Audio | GRPs, spend | Agency |
| Email | Sends, opens | ESP |

CONTROL VARIABLES:
| Variable | Purpose | Source |
|----------|---------|--------|
| Seasonality | Week-of-year effects | Calendar |
| Weather | Temperature, precipitation | Weather API |
| Holidays | Major holiday effects | Calendar |
| Promotions | Price/LTO effects | Internal |
| Competitive | Competitor activity | Competitive Intel |
| Economic | Unemployment, gas prices | Gov data |
| Distribution | Restaurant count | Internal |
| Events | Local/national events | Research |
```

## Modeling Methodology

### Variable Transformations

```
ADSTOCK TRANSFORMATION:

Purpose: Capture carryover effect of advertising

Formula:
Adstock(t) = Spend(t) + λ * Adstock(t-1)

Where λ (lambda) = decay rate (0 to 1)

TYPICAL DECAY RATES BY CHANNEL:
| Channel | Decay Rate | Half-Life |
|---------|------------|-----------|
| TV | 0.7-0.85 | 2-4 weeks |
| CTV/OTT | 0.6-0.75 | 1-3 weeks |
| Digital Video | 0.5-0.65 | 1-2 weeks |
| Paid Social | 0.3-0.5 | <1 week |
| Paid Search | 0.1-0.3 | 1-3 days |
| Display | 0.4-0.6 | 1 week |
| OOH | 0.6-0.8 | 2-3 weeks |
| Audio | 0.6-0.75 | 1-2 weeks |

SATURATION/DIMINISHING RETURNS:

Purpose: Capture decreasing effectiveness at high spend levels

Common approaches:
1. Log transformation: log(1 + Spend)
2. Hill function: Spend^α / (K^α + Spend^α)
3. Exponential: 1 - e^(-λ*Spend)

Where:
- α = shape parameter
- K = half-saturation point
- λ = rate parameter
```

### Model Specification

```
BASE MODEL STRUCTURE:

Sales = β0 + Σ(βi * Marketing_i) + Σ(γj * Control_j) + ε

Where:
- β0 = base sales (intercept)
- βi = coefficient for marketing variable i
- γj = coefficient for control variable j
- ε = error term

COMMON MODEL FORMS:

1. Linear: Y = β0 + β1*X1 + β2*X2 + ... + ε
   - Simple, interpretable
   - Assumes constant returns

2. Log-Log: log(Y) = β0 + β1*log(X1) + β2*log(X2) + ...
   - Coefficients = elasticities
   - Naturally diminishing returns

3. Semi-Log: log(Y) = β0 + β1*X1 + β2*X2 + ...
   - Y changes by β% for 1-unit X change
   - Common in MMM

4. Multiplicative: Y = β0 * X1^β1 * X2^β2 * ...
   - Channel interactions implicit
   - Popular in MMM literature

MODEL DIAGNOSTICS:
□ R-squared: >0.85 for weekly data
□ Adjusted R-squared: Account for variable count
□ VIF (multicollinearity): <5 for all variables
□ Durbin-Watson: Check for autocorrelation
□ Residual plots: Check for patterns
□ MAPE: Out-of-sample accuracy
```

### Model Validation

```
VALIDATION FRAMEWORK:

IN-SAMPLE DIAGNOSTICS:
- R-squared and adjusted R-squared
- F-statistic (overall significance)
- t-statistics (individual coefficients)
- VIF (variance inflation factor)
- Residual analysis

OUT-OF-SAMPLE TESTING:
- Holdout period (last 8-12 weeks)
- Walk-forward validation
- MAPE (Mean Absolute Percentage Error)
- Directional accuracy

BUSINESS SENSE CHECKS:
□ All marketing coefficients positive
□ ROI within reasonable bounds (1-10x)
□ Contribution shares align with intuition
□ Seasonality patterns make sense
□ Promotion effects in expected direction
□ Base sales reasonable (~60-80% of total)

UNCERTAINTY QUANTIFICATION:
- Bootstrap confidence intervals
- Bayesian credible intervals
- Sensitivity analysis
```

## ROI and Contribution Analysis

### Channel Decomposition

```
SALES DECOMPOSITION:

Total Sales: $XXX,XXX,XXX

CONTRIBUTION WATERFALL:
Base Sales:        $XXX,XXX,XXX (XX%)
├── TV:            $XX,XXX,XXX (X.X%)
├── CTV/OTT:       $X,XXX,XXX (X.X%)
├── Digital Video: $X,XXX,XXX (X.X%)
├── Paid Social:   $X,XXX,XXX (X.X%)
├── Paid Search:   $X,XXX,XXX (X.X%)
├── Display:       $X,XXX,XXX (X.X%)
├── OOH:           $X,XXX,XXX (X.X%)
├── Audio:         $X,XXX,XXX (X.X%)
├── Promotions:    $XX,XXX,XXX (X.X%)
├── Seasonality:   $X,XXX,XXX (X.X%)
└── Other Factors: $X,XXX,XXX (X.X%)
Total Incremental: $XX,XXX,XXX (XX%)

MEDIA CONTRIBUTION:
Total Media Spend: $XX,XXX,XXX
Total Media Sales: $XX,XXX,XXX
Blended Media ROI: X.Xx
```

### ROI Calculation

```
ROI METHODOLOGY:

DEFINITION:
ROI = Incremental Revenue / Marketing Spend

Or for profit-based:
ROI = (Incremental Revenue × Margin - Spend) / Spend

CHANNEL ROI TABLE:
| Channel | Spend | Inc. Revenue | ROI | Rank |
|---------|-------|--------------|-----|------|
| Paid Search | $X.XM | $X.XM | X.Xx | 1 |
| Email | $X.XM | $X.XM | X.Xx | 2 |
| OOH | $X.XM | $X.XM | X.Xx | 3 |
| TV | $X.XM | $X.XM | X.Xx | 4 |
| Paid Social | $X.XM | $X.XM | X.Xx | 5 |
| Display | $X.XM | $X.XM | X.Xx | 6 |

MARGINAL ROI:
The ROI from the next dollar spent (accounting for diminishing returns)

mROI = dRevenue / dSpend at current spend level

Use marginal ROI for optimization, average ROI for reporting
```

## Budget Optimization

### Optimization Framework

```
OPTIMIZATION OBJECTIVE:

Maximize: Total Incremental Revenue
Subject to:
- Total Spend = Budget Constraint
- Channel Min ≤ Channel Spend ≤ Channel Max
- Minimum reach requirements
- Contractual commitments

OPTIMIZATION APPROACHES:

1. Gradient-Based:
   - Equalize marginal ROI across channels
   - Shift from low mROI to high mROI channels
   - Iterate until mROI converged

2. Scenario Analysis:
   - Model outcomes at different spend levels
   - Compare scenarios to current allocation
   - Quantify opportunity cost

3. Constrained Optimization:
   - Linear programming
   - Convex optimization
   - Genetic algorithms
```

### Scenario Planning

```
BUDGET SCENARIO COMPARISON:

SCENARIO A: Efficiency Maximization
Goal: Highest ROI within budget

| Channel | Current | Optimal | Change | Impact |
|---------|---------|---------|--------|--------|
| TV | $X.XM | $X.XM | -X% | -$X.XM |
| Digital | $X.XM | $X.XM | +X% | +$X.XM |
| OOH | $X.XM | $X.XM | -X% | -$X.XM |
| Total | $X.XM | $X.XM | 0% | +$X.XM |

Net Improvement: +$X.XM (+X% ROI)

SCENARIO B: Growth Investment
Goal: Scale spend for volume growth

[Similar table structure]

SCENARIO C: Balanced Growth
Goal: Improve efficiency while growing

[Similar table structure]

IMPLEMENTATION RISK:
- Execution complexity: [Low/Med/High]
- Confidence level: [%]
- Testing recommendation: [Yes/No]
```

## QSR-Specific Factors

### External Variables

```
QSR CONTROL VARIABLES:

WEATHER EFFECTS:
- Temperature: Impact on dine-in vs. drive-thru
- Precipitation: Negative on traffic
- Extreme weather: Major impact
- Seasonal adjustment needed

COMPETITIVE FACTORS:
- Competitor promotional activity
- New store openings nearby
- Menu/price changes
- Share of voice trends

ECONOMIC INDICATORS:
- Unemployment rate (lagged)
- Gas prices (for drive-thru)
- Consumer confidence
- Inflation/food prices

DISTRIBUTION CHANGES:
- New restaurant openings
- Closures or remodels
- Hours changes
- Delivery expansion
```

### Promotional Effects

```
PROMOTION MODELING:

TYPES OF PROMOTIONS:
| Type | Effect Size | Duration |
|------|-------------|----------|
| LTO Launch | +15-30% | 2-4 weeks |
| Value Offer | +5-15% | During promo |
| BOGO | +10-20% | During promo |
| Loyalty Point Bonus | +5-10% | During promo |

PROMOTION INTERACTION:
- Media + Promotion often multiplicative
- Include interaction terms in model
- Separate promoted vs. core menu items

CANNIBALIZATION:
- New items may cannibalize existing
- Account for menu mix shifts
- Net promotional effect
```

### Daypart Analysis

```
DAYPART-LEVEL MMM:

BENEFITS:
- Understand marketing impact by daypart
- Optimize daypart-specific messaging
- Identify growth opportunities

APPROACH:
- Build separate models by daypart
- Or include daypart variables in main model
- Compare channel effectiveness across dayparts

TYPICAL FINDINGS:
| Daypart | Top Channels | Insight |
|---------|--------------|---------|
| Breakfast | Audio, OOH | Drive-time impact |
| Lunch | Search, Social | Intent + discovery |
| Dinner | TV, CTV | Family viewing |
| Late Night | Social, Digital | Young demo |
```

## Reporting and Communication

### Executive Summary Template

```markdown
# Marketing Mix Modeling Results
**Period:** [Date Range]
**Prepared:** [Date]

## Key Findings

1. **Marketing is effective** - Every $1 of media investment
   generates $X.XX in incremental revenue

2. **[Top Channel] shows highest efficiency** - ROI of X.Xx
   suggests opportunity to increase investment

3. **[Underperforming Channel] opportunity** - Current ROI of
   X.Xx indicates need for optimization

## Media Contribution Summary

| Channel | Contribution | ROI | Recommendation |
|---------|--------------|-----|----------------|
| TV | $X.XM (X%) | X.Xx | Maintain |
| Digital | $X.XM (X%) | X.Xx | Increase |
| OOH | $X.XM (X%) | X.Xx | Optimize |

## Budget Optimization Opportunity

By rebalancing $X.XM of current spend, we can generate
an additional $X.XM in annual revenue (+X%).

## Recommended Actions

1. **Increase [Channel]** by X% ($+X.XM)
2. **Reduce [Channel]** by X% ($-X.XM)
3. **Test [new channel/tactic]** with $X.XM pilot
```

### Technical Documentation

```markdown
# MMM Technical Appendix

## Model Specification

Dependent Variable: Weekly Sales ($)
Time Period: [Start] to [End]
Observations: XXX weeks

## Variable Transformations

| Variable | Transformation | Parameters |
|----------|---------------|------------|
| TV GRPs | Adstock (λ=0.75), Log | - |
| Digital Spend | Adstock (λ=0.4), Hill | α=2, K=50K |
| [etc.] | | |

## Model Coefficients

| Variable | Coefficient | Std Error | t-stat | p-value |
|----------|-------------|-----------|--------|---------|
| Intercept | X.XXX | X.XXX | X.XX | 0.XXX |
| TV_adstock | X.XXX | X.XXX | X.XX | 0.XXX |
| [etc.] | | | | |

## Fit Statistics

- R-squared: 0.XXX
- Adjusted R-squared: 0.XXX
- MAPE (holdout): X.X%
- Durbin-Watson: X.XX
```

## Troubleshooting

### Common Issues

| Issue | Possible Cause | Resolution |
|-------|----------------|------------|
| Low R-squared | Missing variables, wrong model form | Add variables, try log form |
| Negative coefficients | Multicollinearity, bad data | Check VIF, validate data |
| High VIF | Correlated variables | Combine or drop variables |
| Autocorrelation | Omitted variable, wrong spec | Add lagged Y, check controls |
| Unrealistic ROI | Scale issues, model error | Check units, validate inputs |
| Poor holdout fit | Overfitting, structural change | Simplify model, check stability |

## Glossary

| Term | Definition |
|------|------------|
| Adstock | Cumulative effect accounting for carryover |
| Coefficient | Relationship strength between X and Y |
| Decomposition | Breaking total into component contributions |
| Elasticity | % change in Y for 1% change in X |
| Incremental | Additional outcome attributable to marketing |
| Marginal ROI | ROI of next dollar spent |
| Saturation | Diminishing returns at high spend |

## Integration Points

This skill integrates with:
- **media-strategy-orchestrator**: Feed results into planning
- **guest-insights-engine**: Guest data for enhanced modeling
- **crm-lifecycle-strategist**: CRM contribution to mix
- **executive-insights-storyteller**: Presentation of findings
