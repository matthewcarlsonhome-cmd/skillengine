#!/usr/bin/env python3
"""
Campaign Analyzer Script for Media Strategy Orchestrator

Aggregates campaign performance across channels, generates cross-channel
performance matrices, and provides efficiency rankings.

Author: Culver's Marketing Analytics Team
Version: 1.0.0
"""

import logging
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, date
import json
import statistics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


class DataQualityError(Exception):
    """Raised when data quality issues are detected"""
    pass


class InsufficientDataError(Exception):
    """Raised when there's not enough data for analysis"""
    pass


class EfficiencyTier(Enum):
    """Efficiency ranking tiers"""
    TOP_PERFORMER = "top_performer"
    ABOVE_AVERAGE = "above_average"
    AVERAGE = "average"
    BELOW_AVERAGE = "below_average"
    UNDERPERFORMER = "underperformer"


@dataclass
class ProcessingResult:
    """Standard result container for processing operations"""
    success: bool
    data: Optional[Any] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChannelMetrics:
    """Metrics for a single channel"""
    channel: str
    impressions: int
    clicks: int
    cost: float
    conversions: int
    conversion_value: float
    video_views: Optional[int] = None
    video_completions: Optional[int] = None

    @property
    def cpm(self) -> float:
        """Cost per thousand impressions"""
        if self.impressions == 0:
            return 0.0
        return (self.cost / self.impressions) * 1000

    @property
    def cpc(self) -> float:
        """Cost per click"""
        if self.clicks == 0:
            return 0.0
        return self.cost / self.clicks

    @property
    def ctr(self) -> float:
        """Click-through rate"""
        if self.impressions == 0:
            return 0.0
        return (self.clicks / self.impressions) * 100

    @property
    def cvr(self) -> float:
        """Conversion rate"""
        if self.clicks == 0:
            return 0.0
        return (self.conversions / self.clicks) * 100

    @property
    def cpa(self) -> float:
        """Cost per acquisition"""
        if self.conversions == 0:
            return 0.0
        return self.cost / self.conversions

    @property
    def roas(self) -> float:
        """Return on ad spend"""
        if self.cost == 0:
            return 0.0
        return self.conversion_value / self.cost

    @property
    def vcr(self) -> Optional[float]:
        """Video completion rate"""
        if self.video_views is None or self.video_views == 0:
            return None
        if self.video_completions is None:
            return None
        return (self.video_completions / self.video_views) * 100

    @property
    def cpv(self) -> Optional[float]:
        """Cost per video view"""
        if self.video_views is None or self.video_views == 0:
            return None
        return self.cost / self.video_views


@dataclass
class CampaignPerformance:
    """Campaign-level performance data"""
    campaign_name: str
    channel: str
    objective: str
    start_date: date
    end_date: date
    metrics: ChannelMetrics
    efficiency_tier: EfficiencyTier = EfficiencyTier.AVERAGE
    efficiency_score: float = 0.0


@dataclass
class CrossChannelAnalysis:
    """Cross-channel analysis results"""
    date_range: Tuple[date, date]
    total_spend: float
    total_impressions: int
    total_clicks: int
    total_conversions: int
    total_conversion_value: float
    channel_breakdown: List[Dict[str, Any]]
    efficiency_rankings: List[Dict[str, Any]]
    recommendations: List[str]
    anomalies: List[Dict[str, Any]]


# QSR Industry Benchmarks
QSR_BENCHMARKS = {
    "tv": {"cpm": 15.0, "reach_efficiency": 0.8},
    "ctv": {"cpm": 25.0, "vcr": 85.0, "cpv": 0.02},
    "digital_video": {"cpm": 12.0, "vcr": 70.0, "cpv": 0.015},
    "paid_social": {"cpm": 10.0, "ctr": 1.0, "cvr": 2.0, "cpa": 15.0},
    "paid_search": {"cpc": 0.75, "ctr": 5.0, "cvr": 4.0, "cpa": 10.0},
    "display": {"cpm": 5.0, "ctr": 0.1, "cvr": 0.5, "cpa": 25.0},
    "ooh": {"cpm": 3.0},
    "audio": {"cpm": 8.0, "completion_rate": 95.0}
}


def validate_campaign_data(
    data: List[Dict[str, Any]],
    required_fields: List[str] = None
) -> ProcessingResult:
    """
    Validate campaign performance data.

    Args:
        data: List of campaign records
        required_fields: Required field names

    Returns:
        ProcessingResult with validation status
    """
    if required_fields is None:
        required_fields = [
            'campaign_name', 'channel', 'impressions', 'clicks',
            'cost', 'conversions'
        ]

    warnings = []
    errors = []
    validated_data = []

    if not data:
        errors.append("No campaign data provided")
        return ProcessingResult(
            success=False,
            data=None,
            warnings=warnings,
            errors=errors,
            metadata={"rows_processed": 0}
        )

    for i, record in enumerate(data):
        record_errors = []
        record_warnings = []

        # Check required fields
        missing_fields = [f for f in required_fields if f not in record]
        if missing_fields:
            record_errors.append(
                f"Row {i+1}: Missing required fields: {', '.join(missing_fields)}"
            )
            errors.extend(record_errors)
            continue

        # Validate numeric fields
        numeric_fields = ['impressions', 'clicks', 'cost', 'conversions']
        for field in numeric_fields:
            try:
                value = float(record[field])
                if value < 0:
                    record_errors.append(
                        f"Row {i+1}: {field} cannot be negative ({value})"
                    )
            except (ValueError, TypeError):
                record_errors.append(
                    f"Row {i+1}: Invalid {field} value '{record[field]}'"
                )

        # Validate logical consistency
        if not record_errors:
            impressions = float(record['impressions'])
            clicks = float(record['clicks'])
            conversions = float(record['conversions'])

            if clicks > impressions:
                record_warnings.append(
                    f"Row {i+1}: Clicks ({clicks}) > Impressions ({impressions}) - data quality issue"
                )

            if conversions > clicks and record['channel'].lower() != 'direct':
                record_warnings.append(
                    f"Row {i+1}: Conversions ({conversions}) > Clicks ({clicks}) - verify attribution"
                )

        # Check for zero spend with conversions
        if not record_errors:
            cost = float(record['cost'])
            conversions = float(record['conversions'])
            if cost == 0 and conversions > 0:
                record_warnings.append(
                    f"Row {i+1}: Conversions without spend - verify data"
                )

        warnings.extend(record_warnings)
        errors.extend(record_errors)

        if not record_errors:
            validated_data.append(record)

    success = len(validated_data) > 0

    return ProcessingResult(
        success=success,
        data=validated_data,
        warnings=warnings,
        errors=errors,
        metadata={
            "rows_processed": len(data),
            "rows_valid": len(validated_data),
            "rows_invalid": len(data) - len(validated_data)
        }
    )


def calculate_efficiency_score(
    metrics: ChannelMetrics,
    channel_type: str,
    benchmarks: Dict[str, Dict[str, float]] = None
) -> Tuple[float, EfficiencyTier]:
    """
    Calculate efficiency score for a channel relative to benchmarks.

    Args:
        metrics: ChannelMetrics object
        channel_type: Type of channel for benchmark lookup
        benchmarks: Benchmark dictionary (defaults to QSR_BENCHMARKS)

    Returns:
        Tuple of (efficiency_score, efficiency_tier)
    """
    if benchmarks is None:
        benchmarks = QSR_BENCHMARKS

    channel_key = channel_type.lower().replace(' ', '_')
    channel_benchmarks = benchmarks.get(channel_key, {})

    scores = []

    # CPM efficiency (lower is better)
    if 'cpm' in channel_benchmarks and metrics.cpm > 0:
        cpm_ratio = channel_benchmarks['cpm'] / metrics.cpm
        cpm_score = min(cpm_ratio * 100, 150)  # Cap at 150
        scores.append(cpm_score)

    # CTR efficiency (higher is better)
    if 'ctr' in channel_benchmarks and metrics.ctr > 0:
        ctr_ratio = metrics.ctr / channel_benchmarks['ctr']
        ctr_score = min(ctr_ratio * 100, 150)
        scores.append(ctr_score)

    # CVR efficiency (higher is better)
    if 'cvr' in channel_benchmarks and metrics.cvr > 0:
        cvr_ratio = metrics.cvr / channel_benchmarks['cvr']
        cvr_score = min(cvr_ratio * 100, 150)
        scores.append(cvr_score)

    # CPA efficiency (lower is better)
    if 'cpa' in channel_benchmarks and metrics.cpa > 0:
        cpa_ratio = channel_benchmarks['cpa'] / metrics.cpa
        cpa_score = min(cpa_ratio * 100, 150)
        scores.append(cpa_score)

    # VCR efficiency for video (higher is better)
    if 'vcr' in channel_benchmarks and metrics.vcr is not None and metrics.vcr > 0:
        vcr_ratio = metrics.vcr / channel_benchmarks['vcr']
        vcr_score = min(vcr_ratio * 100, 150)
        scores.append(vcr_score)

    # Calculate overall efficiency score
    if scores:
        efficiency_score = statistics.mean(scores)
    else:
        efficiency_score = 100.0  # Default to average if no benchmarks match

    # Determine tier
    if efficiency_score >= 130:
        tier = EfficiencyTier.TOP_PERFORMER
    elif efficiency_score >= 110:
        tier = EfficiencyTier.ABOVE_AVERAGE
    elif efficiency_score >= 90:
        tier = EfficiencyTier.AVERAGE
    elif efficiency_score >= 70:
        tier = EfficiencyTier.BELOW_AVERAGE
    else:
        tier = EfficiencyTier.UNDERPERFORMER

    return efficiency_score, tier


def detect_anomalies(
    campaigns: List[CampaignPerformance]
) -> List[Dict[str, Any]]:
    """
    Detect anomalies in campaign performance data.

    Args:
        campaigns: List of CampaignPerformance objects

    Returns:
        List of anomaly dictionaries
    """
    anomalies = []

    if len(campaigns) < 3:
        return anomalies

    # Group by channel for comparison
    channel_groups = {}
    for campaign in campaigns:
        channel = campaign.channel
        if channel not in channel_groups:
            channel_groups[channel] = []
        channel_groups[channel].append(campaign)

    for channel, channel_campaigns in channel_groups.items():
        if len(channel_campaigns) < 2:
            continue

        # Calculate channel averages
        cpas = [c.metrics.cpa for c in channel_campaigns if c.metrics.cpa > 0]
        ctrs = [c.metrics.ctr for c in channel_campaigns if c.metrics.ctr > 0]
        roas_values = [c.metrics.roas for c in channel_campaigns if c.metrics.roas > 0]

        if cpas:
            avg_cpa = statistics.mean(cpas)
            std_cpa = statistics.stdev(cpas) if len(cpas) > 1 else avg_cpa * 0.2

            for campaign in channel_campaigns:
                if campaign.metrics.cpa > 0:
                    z_score = (campaign.metrics.cpa - avg_cpa) / std_cpa if std_cpa > 0 else 0
                    if z_score > 2:
                        anomalies.append({
                            "campaign": campaign.campaign_name,
                            "channel": channel,
                            "metric": "CPA",
                            "value": campaign.metrics.cpa,
                            "expected": avg_cpa,
                            "deviation": f"+{((campaign.metrics.cpa - avg_cpa) / avg_cpa * 100):.1f}%",
                            "severity": "high" if z_score > 3 else "medium",
                            "recommendation": "Investigate targeting, creative, or landing page issues"
                        })
                    elif z_score < -2:
                        anomalies.append({
                            "campaign": campaign.campaign_name,
                            "channel": channel,
                            "metric": "CPA",
                            "value": campaign.metrics.cpa,
                            "expected": avg_cpa,
                            "deviation": f"{((campaign.metrics.cpa - avg_cpa) / avg_cpa * 100):.1f}%",
                            "severity": "info",
                            "recommendation": "Analyze success factors for potential scaling"
                        })

        if ctrs:
            avg_ctr = statistics.mean(ctrs)
            std_ctr = statistics.stdev(ctrs) if len(ctrs) > 1 else avg_ctr * 0.2

            for campaign in channel_campaigns:
                if campaign.metrics.ctr > 0:
                    z_score = (campaign.metrics.ctr - avg_ctr) / std_ctr if std_ctr > 0 else 0
                    if z_score < -2:
                        anomalies.append({
                            "campaign": campaign.campaign_name,
                            "channel": channel,
                            "metric": "CTR",
                            "value": campaign.metrics.ctr,
                            "expected": avg_ctr,
                            "deviation": f"{((campaign.metrics.ctr - avg_ctr) / avg_ctr * 100):.1f}%",
                            "severity": "medium",
                            "recommendation": "Review creative assets and audience targeting"
                        })

    return anomalies


def analyze_campaigns(
    campaign_data: List[Dict[str, Any]],
    date_range: Tuple[str, str] = None
) -> ProcessingResult:
    """
    Perform comprehensive campaign analysis across channels.

    Args:
        campaign_data: List of campaign performance records
        date_range: Optional tuple of (start_date, end_date) strings

    Returns:
        ProcessingResult containing CrossChannelAnalysis
    """
    logger.info("Starting campaign analysis")

    # Validate data
    validation_result = validate_campaign_data(campaign_data)
    if not validation_result.success:
        logger.error(f"Validation failed: {validation_result.errors}")
        return validation_result

    # Convert to CampaignPerformance objects
    campaigns = []
    for record in validation_result.data:
        try:
            metrics = ChannelMetrics(
                channel=record['channel'],
                impressions=int(record['impressions']),
                clicks=int(record['clicks']),
                cost=float(record['cost']),
                conversions=int(record['conversions']),
                conversion_value=float(record.get('conversion_value', 0)),
                video_views=int(record['video_views']) if 'video_views' in record else None,
                video_completions=int(record['video_completions']) if 'video_completions' in record else None
            )

            efficiency_score, efficiency_tier = calculate_efficiency_score(
                metrics, record['channel']
            )

            start_date = datetime.strptime(
                record.get('start_date', '2024-01-01'), '%Y-%m-%d'
            ).date() if isinstance(record.get('start_date'), str) else record.get('start_date', date.today())

            end_date = datetime.strptime(
                record.get('end_date', '2024-12-31'), '%Y-%m-%d'
            ).date() if isinstance(record.get('end_date'), str) else record.get('end_date', date.today())

            campaign = CampaignPerformance(
                campaign_name=record['campaign_name'],
                channel=record['channel'],
                objective=record.get('objective', 'awareness'),
                start_date=start_date,
                end_date=end_date,
                metrics=metrics,
                efficiency_tier=efficiency_tier,
                efficiency_score=efficiency_score
            )
            campaigns.append(campaign)

        except Exception as e:
            logger.warning(f"Error processing campaign record: {e}")
            validation_result.warnings.append(f"Skipped campaign: {str(e)}")

    if not campaigns:
        return ProcessingResult(
            success=False,
            data=None,
            warnings=validation_result.warnings,
            errors=["No valid campaigns to analyze"],
            metadata=validation_result.metadata
        )

    # Aggregate totals
    total_spend = sum(c.metrics.cost for c in campaigns)
    total_impressions = sum(c.metrics.impressions for c in campaigns)
    total_clicks = sum(c.metrics.clicks for c in campaigns)
    total_conversions = sum(c.metrics.conversions for c in campaigns)
    total_value = sum(c.metrics.conversion_value for c in campaigns)

    # Channel breakdown
    channel_summary = {}
    for campaign in campaigns:
        channel = campaign.channel
        if channel not in channel_summary:
            channel_summary[channel] = {
                "channel": channel,
                "campaigns": 0,
                "impressions": 0,
                "clicks": 0,
                "cost": 0,
                "conversions": 0,
                "conversion_value": 0
            }
        channel_summary[channel]["campaigns"] += 1
        channel_summary[channel]["impressions"] += campaign.metrics.impressions
        channel_summary[channel]["clicks"] += campaign.metrics.clicks
        channel_summary[channel]["cost"] += campaign.metrics.cost
        channel_summary[channel]["conversions"] += campaign.metrics.conversions
        channel_summary[channel]["conversion_value"] += campaign.metrics.conversion_value

    # Calculate derived metrics for channel summary
    channel_breakdown = []
    for channel, data in channel_summary.items():
        channel_metrics = ChannelMetrics(
            channel=channel,
            impressions=data["impressions"],
            clicks=data["clicks"],
            cost=data["cost"],
            conversions=data["conversions"],
            conversion_value=data["conversion_value"]
        )
        efficiency_score, efficiency_tier = calculate_efficiency_score(channel_metrics, channel)

        data["cpm"] = channel_metrics.cpm
        data["cpc"] = channel_metrics.cpc
        data["ctr"] = channel_metrics.ctr
        data["cvr"] = channel_metrics.cvr
        data["cpa"] = channel_metrics.cpa
        data["roas"] = channel_metrics.roas
        data["efficiency_score"] = efficiency_score
        data["efficiency_tier"] = efficiency_tier.value
        data["spend_share"] = (data["cost"] / total_spend * 100) if total_spend > 0 else 0
        data["conversion_share"] = (data["conversions"] / total_conversions * 100) if total_conversions > 0 else 0

        channel_breakdown.append(data)

    # Sort by efficiency score for rankings
    efficiency_rankings = sorted(
        [
            {
                "rank": i + 1,
                "campaign": c.campaign_name,
                "channel": c.channel,
                "efficiency_score": c.efficiency_score,
                "efficiency_tier": c.efficiency_tier.value,
                "cost": c.metrics.cost,
                "conversions": c.metrics.conversions,
                "cpa": c.metrics.cpa,
                "roas": c.metrics.roas
            }
            for i, c in enumerate(sorted(campaigns, key=lambda x: x.efficiency_score, reverse=True))
        ],
        key=lambda x: x["rank"]
    )

    # Detect anomalies
    anomalies = detect_anomalies(campaigns)

    # Generate recommendations
    recommendations = []

    # Identify channels to scale
    top_channels = [c for c in channel_breakdown if c["efficiency_tier"] == "top_performer"]
    if top_channels:
        for channel in top_channels:
            recommendations.append(
                f"Consider increasing investment in {channel['channel']} - "
                f"efficiency score of {channel['efficiency_score']:.0f} with "
                f"ROAS of {channel['roas']:.2f}x"
            )

    # Identify channels to optimize
    poor_channels = [c for c in channel_breakdown if c["efficiency_tier"] == "underperformer"]
    if poor_channels:
        for channel in poor_channels:
            recommendations.append(
                f"Review {channel['channel']} strategy - "
                f"efficiency score of {channel['efficiency_score']:.0f}. "
                f"Consider creative refresh, audience optimization, or budget reallocation"
            )

    # Budget mix recommendations
    channel_breakdown_sorted = sorted(channel_breakdown, key=lambda x: x["roas"], reverse=True)
    if len(channel_breakdown_sorted) >= 2:
        best_channel = channel_breakdown_sorted[0]
        worst_channel = channel_breakdown_sorted[-1]
        if best_channel["roas"] > worst_channel["roas"] * 2:
            recommendations.append(
                f"Significant ROAS gap between {best_channel['channel']} ({best_channel['roas']:.2f}x) "
                f"and {worst_channel['channel']} ({worst_channel['roas']:.2f}x). "
                f"Consider rebalancing budget allocation."
            )

    # Determine date range
    if date_range:
        start_str, end_str = date_range
        analysis_start = datetime.strptime(start_str, '%Y-%m-%d').date()
        analysis_end = datetime.strptime(end_str, '%Y-%m-%d').date()
    else:
        analysis_start = min(c.start_date for c in campaigns)
        analysis_end = max(c.end_date for c in campaigns)

    # Compile analysis
    analysis = CrossChannelAnalysis(
        date_range=(analysis_start, analysis_end),
        total_spend=total_spend,
        total_impressions=total_impressions,
        total_clicks=total_clicks,
        total_conversions=total_conversions,
        total_conversion_value=total_value,
        channel_breakdown=channel_breakdown,
        efficiency_rankings=efficiency_rankings,
        recommendations=recommendations,
        anomalies=anomalies
    )

    # Convert to serializable format
    result_data = {
        "date_range": {
            "start": analysis.date_range[0].isoformat(),
            "end": analysis.date_range[1].isoformat()
        },
        "summary": {
            "total_spend": analysis.total_spend,
            "total_impressions": analysis.total_impressions,
            "total_clicks": analysis.total_clicks,
            "total_conversions": analysis.total_conversions,
            "total_conversion_value": analysis.total_conversion_value,
            "blended_cpm": (analysis.total_spend / analysis.total_impressions * 1000) if analysis.total_impressions > 0 else 0,
            "blended_cpc": (analysis.total_spend / analysis.total_clicks) if analysis.total_clicks > 0 else 0,
            "blended_cpa": (analysis.total_spend / analysis.total_conversions) if analysis.total_conversions > 0 else 0,
            "blended_roas": (analysis.total_conversion_value / analysis.total_spend) if analysis.total_spend > 0 else 0,
            "blended_ctr": (analysis.total_clicks / analysis.total_impressions * 100) if analysis.total_impressions > 0 else 0,
            "blended_cvr": (analysis.total_conversions / analysis.total_clicks * 100) if analysis.total_clicks > 0 else 0
        },
        "channel_breakdown": analysis.channel_breakdown,
        "efficiency_rankings": analysis.efficiency_rankings,
        "anomalies": analysis.anomalies,
        "recommendations": analysis.recommendations
    }

    logger.info(f"Campaign analysis complete - {len(campaigns)} campaigns across {len(channel_breakdown)} channels")

    return ProcessingResult(
        success=True,
        data=result_data,
        warnings=validation_result.warnings,
        errors=[],
        metadata={
            **validation_result.metadata,
            "campaigns_analyzed": len(campaigns),
            "channels_analyzed": len(channel_breakdown),
            "anomalies_detected": len(anomalies)
        }
    )


def format_analysis_report(analysis: Dict[str, Any]) -> str:
    """
    Format campaign analysis as human-readable text report.

    Args:
        analysis: Analysis dictionary from analyze_campaigns

    Returns:
        Formatted text report
    """
    lines = [
        "=" * 80,
        "CROSS-CHANNEL CAMPAIGN ANALYSIS",
        f"Period: {analysis['date_range']['start']} to {analysis['date_range']['end']}",
        "=" * 80,
        "",
        "PERFORMANCE SUMMARY",
        "-" * 40,
        f"Total Spend:        ${analysis['summary']['total_spend']:>15,.2f}",
        f"Total Impressions:  {analysis['summary']['total_impressions']:>15,}",
        f"Total Clicks:       {analysis['summary']['total_clicks']:>15,}",
        f"Total Conversions:  {analysis['summary']['total_conversions']:>15,}",
        f"Total Value:        ${analysis['summary']['total_conversion_value']:>15,.2f}",
        "",
        f"Blended CPM:        ${analysis['summary']['blended_cpm']:>15,.2f}",
        f"Blended CPC:        ${analysis['summary']['blended_cpc']:>15,.2f}",
        f"Blended CPA:        ${analysis['summary']['blended_cpa']:>15,.2f}",
        f"Blended ROAS:       {analysis['summary']['blended_roas']:>15,.2f}x",
        "",
        "CHANNEL BREAKDOWN",
        "-" * 40,
    ]

    # Channel table
    header = f"{'Channel':<15} {'Spend':>12} {'Conv':>8} {'CPA':>10} {'ROAS':>8} {'Efficiency':>12}"
    lines.append(header)
    lines.append("-" * len(header))

    for channel in sorted(analysis['channel_breakdown'], key=lambda x: x['cost'], reverse=True):
        tier_emoji = {
            'top_performer': '★',
            'above_average': '↑',
            'average': '=',
            'below_average': '↓',
            'underperformer': '✗'
        }.get(channel['efficiency_tier'], '?')

        lines.append(
            f"{channel['channel']:<15} "
            f"${channel['cost']:>11,.0f} "
            f"{channel['conversions']:>8,} "
            f"${channel['cpa']:>9,.2f} "
            f"{channel['roas']:>7,.2f}x "
            f"{tier_emoji} {channel['efficiency_score']:>6.0f}"
        )

    # Top campaigns
    lines.extend([
        "",
        "TOP 5 CAMPAIGNS BY EFFICIENCY",
        "-" * 40,
    ])

    for ranking in analysis['efficiency_rankings'][:5]:
        lines.append(
            f"{ranking['rank']}. {ranking['campaign']} ({ranking['channel']}) - "
            f"Score: {ranking['efficiency_score']:.0f}"
        )

    # Anomalies
    if analysis['anomalies']:
        lines.extend([
            "",
            "ANOMALIES DETECTED",
            "-" * 40,
        ])
        for anomaly in analysis['anomalies']:
            lines.append(
                f"[{anomaly['severity'].upper()}] {anomaly['campaign']} - "
                f"{anomaly['metric']}: {anomaly['value']:.2f} "
                f"(expected: {anomaly['expected']:.2f}, {anomaly['deviation']})"
            )
            lines.append(f"  → {anomaly['recommendation']}")

    # Recommendations
    if analysis['recommendations']:
        lines.extend([
            "",
            "RECOMMENDATIONS",
            "-" * 40,
        ])
        for i, rec in enumerate(analysis['recommendations'], 1):
            lines.append(f"{i}. {rec}")

    lines.append("")
    lines.append("=" * 80)

    return "\n".join(lines)


# Example usage
if __name__ == "__main__":
    sample_campaigns = [
        {
            "campaign_name": "Brand Awareness - TV",
            "channel": "TV",
            "impressions": 50000000,
            "clicks": 0,
            "cost": 500000,
            "conversions": 5000,
            "conversion_value": 2500000,
            "objective": "awareness"
        },
        {
            "campaign_name": "Summer LTO - Paid Social",
            "channel": "Paid Social",
            "impressions": 10000000,
            "clicks": 100000,
            "cost": 100000,
            "conversions": 2500,
            "conversion_value": 125000,
            "objective": "traffic"
        },
        {
            "campaign_name": "Brand - Paid Search",
            "channel": "Paid Search",
            "impressions": 500000,
            "clicks": 25000,
            "cost": 20000,
            "conversions": 1000,
            "conversion_value": 100000,
            "objective": "conversion"
        },
        {
            "campaign_name": "Non-Brand - Paid Search",
            "channel": "Paid Search",
            "impressions": 2000000,
            "clicks": 80000,
            "cost": 80000,
            "conversions": 2000,
            "conversion_value": 200000,
            "objective": "conversion"
        },
        {
            "campaign_name": "Retargeting - Display",
            "channel": "Display",
            "impressions": 20000000,
            "clicks": 20000,
            "cost": 40000,
            "conversions": 800,
            "conversion_value": 80000,
            "objective": "conversion"
        }
    ]

    result = analyze_campaigns(sample_campaigns)

    if result.success:
        print(format_analysis_report(result.data))
        print("\n\nJSON Output:")
        print(json.dumps(result.data, indent=2, default=str))
    else:
        print("Analysis failed:")
        for error in result.errors:
            print(f"  - {error}")
