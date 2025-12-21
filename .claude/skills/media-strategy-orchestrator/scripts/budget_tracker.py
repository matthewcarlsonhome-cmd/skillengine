#!/usr/bin/env python3
"""
Budget Tracker Script for Media Strategy Orchestrator

Parses budget files, calculates spend pacing, performs variance analysis,
and generates alerts for over/under delivery.

Author: Culver's Marketing Analytics Team
Version: 1.0.0
"""

import logging
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, date
import json

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


class PacingStatus(Enum):
    """Budget pacing status indicators"""
    ON_TRACK = "on_track"
    OVER_PACING = "over_pacing"
    UNDER_PACING = "under_pacing"
    CRITICAL_OVER = "critical_over"
    CRITICAL_UNDER = "critical_under"


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class ProcessingResult:
    """Standard result container for processing operations"""
    success: bool
    data: Optional[Any] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BudgetEntry:
    """Single budget line item"""
    channel: str
    budget: float
    spent: float
    committed: float
    period_start: date
    period_end: date

    @property
    def remaining(self) -> float:
        """Calculate remaining budget"""
        return self.budget - self.spent - self.committed

    @property
    def utilization_rate(self) -> float:
        """Calculate budget utilization percentage"""
        if self.budget == 0:
            return 0.0
        return (self.spent + self.committed) / self.budget * 100


@dataclass
class PacingAnalysis:
    """Pacing analysis result"""
    channel: str
    budget: float
    spent: float
    expected_spend: float
    pacing_percentage: float
    variance: float
    variance_percentage: float
    status: PacingStatus
    days_elapsed: int
    days_remaining: int
    forecast_end_of_period: float
    alerts: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class VarianceSummary:
    """Variance analysis summary"""
    total_budget: float
    total_spent: float
    total_variance: float
    total_variance_percentage: float
    channels_over_budget: List[str]
    channels_under_budget: List[str]
    channels_on_track: List[str]
    recommendations: List[str]


def validate_budget_data(
    data: List[Dict[str, Any]],
    required_columns: List[str] = None
) -> ProcessingResult:
    """
    Validate budget data for completeness and correctness.

    Args:
        data: List of budget records as dictionaries
        required_columns: List of required column names

    Returns:
        ProcessingResult with validation status and details
    """
    if required_columns is None:
        required_columns = ['channel', 'budget', 'spent', 'committed',
                          'period_start', 'period_end']

    warnings = []
    errors = []
    validated_data = []

    if not data:
        errors.append("No budget data provided")
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

        # Check for required columns
        for col in required_columns:
            if col not in record:
                record_errors.append(f"Row {i+1}: Missing required column '{col}'")

        if record_errors:
            errors.extend(record_errors)
            continue

        # Validate numeric fields
        try:
            budget = float(record['budget'])
            if budget < 0:
                record_errors.append(f"Row {i+1}: Budget cannot be negative ({budget})")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid budget value '{record['budget']}'")

        try:
            spent = float(record['spent'])
            if spent < 0:
                record_errors.append(f"Row {i+1}: Spent cannot be negative ({spent})")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid spent value '{record['spent']}'")

        try:
            committed = float(record.get('committed', 0))
            if committed < 0:
                record_warnings.append(f"Row {i+1}: Negative committed value ({committed})")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid committed value '{record['committed']}'")

        # Validate dates
        try:
            if isinstance(record['period_start'], str):
                period_start = datetime.strptime(record['period_start'], '%Y-%m-%d').date()
            else:
                period_start = record['period_start']
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid period_start date format")

        try:
            if isinstance(record['period_end'], str):
                period_end = datetime.strptime(record['period_end'], '%Y-%m-%d').date()
            else:
                period_end = record['period_end']
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid period_end date format")

        # Check date logic
        if not record_errors:
            if period_start > period_end:
                record_errors.append(f"Row {i+1}: period_start cannot be after period_end")

        # Check if spent exceeds budget significantly
        if not record_errors:
            if spent > budget * 1.2:
                record_warnings.append(
                    f"Row {i+1}: Spent ({spent}) exceeds budget ({budget}) by >20%"
                )

        warnings.extend(record_warnings)
        errors.extend(record_errors)

        if not record_errors:
            validated_data.append(record)

    success = len(errors) == 0 and len(validated_data) > 0

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


def calculate_pacing(
    budget_entry: BudgetEntry,
    as_of_date: date = None
) -> PacingAnalysis:
    """
    Calculate pacing analysis for a single budget entry.

    Args:
        budget_entry: BudgetEntry object with budget data
        as_of_date: Date to calculate pacing as of (defaults to today)

    Returns:
        PacingAnalysis with detailed pacing metrics
    """
    if as_of_date is None:
        as_of_date = date.today()

    # Calculate time progression
    total_days = (budget_entry.period_end - budget_entry.period_start).days + 1
    days_elapsed = min(
        (as_of_date - budget_entry.period_start).days + 1,
        total_days
    )
    days_remaining = max(0, (budget_entry.period_end - as_of_date).days)

    # Handle edge case of analysis date before period start
    if days_elapsed < 0:
        days_elapsed = 0
        days_remaining = total_days

    # Calculate expected spend (linear pacing)
    time_progress = days_elapsed / total_days if total_days > 0 else 0
    expected_spend = budget_entry.budget * time_progress

    # Calculate pacing percentage
    if expected_spend > 0:
        pacing_percentage = (budget_entry.spent / expected_spend) * 100
    elif budget_entry.spent > 0:
        pacing_percentage = 200.0  # Over 100% if spend exists but none expected
    else:
        pacing_percentage = 100.0  # On track if no spend expected and none occurred

    # Calculate variance
    variance = budget_entry.spent - expected_spend
    variance_percentage = (variance / expected_spend * 100) if expected_spend > 0 else 0

    # Forecast end of period spend
    if days_elapsed > 0:
        daily_rate = budget_entry.spent / days_elapsed
        forecast_end = budget_entry.spent + (daily_rate * days_remaining)
    else:
        forecast_end = 0

    # Determine pacing status
    if pacing_percentage >= 120:
        status = PacingStatus.CRITICAL_OVER
    elif pacing_percentage >= 110:
        status = PacingStatus.OVER_PACING
    elif pacing_percentage <= 80:
        status = PacingStatus.CRITICAL_UNDER
    elif pacing_percentage <= 90:
        status = PacingStatus.UNDER_PACING
    else:
        status = PacingStatus.ON_TRACK

    # Generate alerts
    alerts = []

    if status == PacingStatus.CRITICAL_OVER:
        alerts.append({
            "severity": AlertSeverity.CRITICAL.value,
            "message": f"{budget_entry.channel}: Critical overspend - {pacing_percentage:.1f}% of expected",
            "recommended_action": "Immediately reduce spend or reallocate budget"
        })
    elif status == PacingStatus.OVER_PACING:
        alerts.append({
            "severity": AlertSeverity.WARNING.value,
            "message": f"{budget_entry.channel}: Over pacing - {pacing_percentage:.1f}% of expected",
            "recommended_action": "Monitor closely and consider reducing daily caps"
        })
    elif status == PacingStatus.CRITICAL_UNDER:
        alerts.append({
            "severity": AlertSeverity.CRITICAL.value,
            "message": f"{budget_entry.channel}: Critical underspend - {pacing_percentage:.1f}% of expected",
            "recommended_action": "Identify delivery blockers or reallocate budget"
        })
    elif status == PacingStatus.UNDER_PACING:
        alerts.append({
            "severity": AlertSeverity.WARNING.value,
            "message": f"{budget_entry.channel}: Under pacing - {pacing_percentage:.1f}% of expected",
            "recommended_action": "Increase bids or expand targeting"
        })

    # Add forecast alert if significantly different from budget
    forecast_variance = forecast_end - budget_entry.budget
    forecast_variance_pct = (forecast_variance / budget_entry.budget * 100) if budget_entry.budget > 0 else 0

    if abs(forecast_variance_pct) > 15:
        alerts.append({
            "severity": AlertSeverity.INFO.value,
            "message": f"{budget_entry.channel}: Forecasted to end period at ${forecast_end:,.2f} ({forecast_variance_pct:+.1f}% vs budget)",
            "recommended_action": "Review pacing strategy for remainder of period"
        })

    return PacingAnalysis(
        channel=budget_entry.channel,
        budget=budget_entry.budget,
        spent=budget_entry.spent,
        expected_spend=expected_spend,
        pacing_percentage=pacing_percentage,
        variance=variance,
        variance_percentage=variance_percentage,
        status=status,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        forecast_end_of_period=forecast_end,
        alerts=alerts
    )


def analyze_variance(
    pacing_analyses: List[PacingAnalysis]
) -> VarianceSummary:
    """
    Generate variance analysis summary across all channels.

    Args:
        pacing_analyses: List of PacingAnalysis objects

    Returns:
        VarianceSummary with aggregated variance information
    """
    if not pacing_analyses:
        raise InsufficientDataError("No pacing data provided for variance analysis")

    total_budget = sum(p.budget for p in pacing_analyses)
    total_spent = sum(p.spent for p in pacing_analyses)
    total_expected = sum(p.expected_spend for p in pacing_analyses)

    total_variance = total_spent - total_expected
    total_variance_percentage = (
        (total_variance / total_expected * 100) if total_expected > 0 else 0
    )

    channels_over = [p.channel for p in pacing_analyses
                    if p.status in [PacingStatus.OVER_PACING, PacingStatus.CRITICAL_OVER]]
    channels_under = [p.channel for p in pacing_analyses
                     if p.status in [PacingStatus.UNDER_PACING, PacingStatus.CRITICAL_UNDER]]
    channels_on_track = [p.channel for p in pacing_analyses
                        if p.status == PacingStatus.ON_TRACK]

    # Generate recommendations
    recommendations = []

    if channels_over and channels_under:
        recommendations.append(
            f"Consider reallocating budget from over-pacing channels "
            f"({', '.join(channels_over)}) to under-pacing channels "
            f"({', '.join(channels_under)})"
        )

    if total_variance_percentage > 10:
        recommendations.append(
            f"Overall portfolio is over-pacing by {total_variance_percentage:.1f}%. "
            "Review and reduce spend across highest variance channels."
        )
    elif total_variance_percentage < -10:
        recommendations.append(
            f"Overall portfolio is under-pacing by {abs(total_variance_percentage):.1f}%. "
            "Identify delivery barriers and consider increasing investment in performing channels."
        )

    # Add channel-specific recommendations
    for analysis in pacing_analyses:
        if analysis.status == PacingStatus.CRITICAL_OVER:
            recommendations.append(
                f"URGENT: {analysis.channel} requires immediate attention - "
                f"${analysis.variance:,.2f} over expected spend"
            )
        elif analysis.status == PacingStatus.CRITICAL_UNDER:
            recommendations.append(
                f"URGENT: {analysis.channel} significantly under-delivering - "
                f"${abs(analysis.variance):,.2f} below expected spend"
            )

    return VarianceSummary(
        total_budget=total_budget,
        total_spent=total_spent,
        total_variance=total_variance,
        total_variance_percentage=total_variance_percentage,
        channels_over_budget=channels_over,
        channels_under_budget=channels_under,
        channels_on_track=channels_on_track,
        recommendations=recommendations
    )


def generate_pacing_report(
    budget_data: List[Dict[str, Any]],
    as_of_date: date = None
) -> ProcessingResult:
    """
    Generate comprehensive pacing report from budget data.

    Args:
        budget_data: List of budget records
        as_of_date: Date to calculate pacing as of

    Returns:
        ProcessingResult containing pacing report data
    """
    logger.info("Starting pacing report generation")

    # Validate input data
    validation_result = validate_budget_data(budget_data)

    if not validation_result.success:
        logger.error(f"Data validation failed: {validation_result.errors}")
        return validation_result

    # Convert to BudgetEntry objects
    budget_entries = []
    for record in validation_result.data:
        try:
            period_start = record['period_start']
            if isinstance(period_start, str):
                period_start = datetime.strptime(period_start, '%Y-%m-%d').date()

            period_end = record['period_end']
            if isinstance(period_end, str):
                period_end = datetime.strptime(period_end, '%Y-%m-%d').date()

            entry = BudgetEntry(
                channel=record['channel'],
                budget=float(record['budget']),
                spent=float(record['spent']),
                committed=float(record.get('committed', 0)),
                period_start=period_start,
                period_end=period_end
            )
            budget_entries.append(entry)
        except Exception as e:
            logger.warning(f"Error processing record: {e}")
            validation_result.warnings.append(f"Skipped record: {str(e)}")

    if not budget_entries:
        return ProcessingResult(
            success=False,
            data=None,
            warnings=validation_result.warnings,
            errors=["No valid budget entries to analyze"],
            metadata=validation_result.metadata
        )

    # Calculate pacing for each entry
    pacing_analyses = []
    all_alerts = []

    for entry in budget_entries:
        analysis = calculate_pacing(entry, as_of_date)
        pacing_analyses.append(analysis)
        all_alerts.extend(analysis.alerts)

    # Generate variance summary
    variance_summary = analyze_variance(pacing_analyses)

    # Compile report
    report = {
        "report_date": (as_of_date or date.today()).isoformat(),
        "summary": {
            "total_budget": variance_summary.total_budget,
            "total_spent": variance_summary.total_spent,
            "total_remaining": variance_summary.total_budget - variance_summary.total_spent,
            "overall_pacing": (
                variance_summary.total_spent /
                (variance_summary.total_budget * 0.5) * 100  # Assuming mid-period
            ) if variance_summary.total_budget > 0 else 0,
            "channels_on_track": len(variance_summary.channels_on_track),
            "channels_at_risk": len(variance_summary.channels_over_budget) +
                               len(variance_summary.channels_under_budget)
        },
        "channel_details": [
            {
                "channel": a.channel,
                "budget": a.budget,
                "spent": a.spent,
                "expected_spend": a.expected_spend,
                "remaining": a.budget - a.spent,
                "pacing_percentage": a.pacing_percentage,
                "variance": a.variance,
                "status": a.status.value,
                "days_elapsed": a.days_elapsed,
                "days_remaining": a.days_remaining,
                "forecast_end_of_period": a.forecast_end_of_period
            }
            for a in pacing_analyses
        ],
        "alerts": all_alerts,
        "recommendations": variance_summary.recommendations,
        "variance_analysis": {
            "total_variance": variance_summary.total_variance,
            "total_variance_percentage": variance_summary.total_variance_percentage,
            "channels_over_budget": variance_summary.channels_over_budget,
            "channels_under_budget": variance_summary.channels_under_budget,
            "channels_on_track": variance_summary.channels_on_track
        }
    }

    logger.info(f"Pacing report generated successfully for {len(pacing_analyses)} channels")

    return ProcessingResult(
        success=True,
        data=report,
        warnings=validation_result.warnings,
        errors=[],
        metadata={
            **validation_result.metadata,
            "channels_analyzed": len(pacing_analyses),
            "alerts_generated": len(all_alerts)
        }
    )


def format_pacing_report_text(report: Dict[str, Any]) -> str:
    """
    Format pacing report as human-readable text.

    Args:
        report: Report dictionary from generate_pacing_report

    Returns:
        Formatted text report
    """
    lines = [
        "=" * 80,
        "BUDGET PACING REPORT",
        f"Report Date: {report['report_date']}",
        "=" * 80,
        "",
        "SUMMARY",
        "-" * 40,
        f"Total Budget:    ${report['summary']['total_budget']:>15,.2f}",
        f"Total Spent:     ${report['summary']['total_spent']:>15,.2f}",
        f"Total Remaining: ${report['summary']['total_remaining']:>15,.2f}",
        f"Channels On Track: {report['summary']['channels_on_track']}",
        f"Channels At Risk:  {report['summary']['channels_at_risk']}",
        "",
        "CHANNEL DETAILS",
        "-" * 40,
    ]

    # Add channel table
    header = f"{'Channel':<20} {'Budget':>12} {'Spent':>12} {'Pacing':>8} {'Status':>12}"
    lines.append(header)
    lines.append("-" * len(header))

    for channel in report['channel_details']:
        status_emoji = {
            'on_track': '✓',
            'over_pacing': '↑',
            'under_pacing': '↓',
            'critical_over': '⚠️',
            'critical_under': '⚠️'
        }.get(channel['status'], '?')

        lines.append(
            f"{channel['channel']:<20} "
            f"${channel['budget']:>11,.0f} "
            f"${channel['spent']:>11,.0f} "
            f"{channel['pacing_percentage']:>7.1f}% "
            f"{status_emoji} {channel['status']:>10}"
        )

    # Add alerts
    if report['alerts']:
        lines.extend([
            "",
            "ALERTS",
            "-" * 40,
        ])
        for alert in report['alerts']:
            lines.append(f"[{alert['severity'].upper()}] {alert['message']}")
            lines.append(f"  → {alert['recommended_action']}")

    # Add recommendations
    if report['recommendations']:
        lines.extend([
            "",
            "RECOMMENDATIONS",
            "-" * 40,
        ])
        for i, rec in enumerate(report['recommendations'], 1):
            lines.append(f"{i}. {rec}")

    lines.append("")
    lines.append("=" * 80)

    return "\n".join(lines)


# Example usage and testing
if __name__ == "__main__":
    # Sample budget data for testing
    sample_data = [
        {
            "channel": "TV",
            "budget": 500000,
            "spent": 280000,
            "committed": 50000,
            "period_start": "2024-01-01",
            "period_end": "2024-03-31"
        },
        {
            "channel": "Digital Video",
            "budget": 200000,
            "spent": 85000,
            "committed": 20000,
            "period_start": "2024-01-01",
            "period_end": "2024-03-31"
        },
        {
            "channel": "Paid Social",
            "budget": 150000,
            "spent": 95000,
            "committed": 10000,
            "period_start": "2024-01-01",
            "period_end": "2024-03-31"
        },
        {
            "channel": "Paid Search",
            "budget": 100000,
            "spent": 35000,
            "committed": 5000,
            "period_start": "2024-01-01",
            "period_end": "2024-03-31"
        },
        {
            "channel": "OOH",
            "budget": 75000,
            "spent": 75000,
            "committed": 0,
            "period_start": "2024-01-01",
            "period_end": "2024-03-31"
        }
    ]

    # Generate report
    result = generate_pacing_report(sample_data, date(2024, 2, 15))

    if result.success:
        print(format_pacing_report_text(result.data))
        print("\n\nJSON Output:")
        print(json.dumps(result.data, indent=2, default=str))
    else:
        print("Report generation failed:")
        for error in result.errors:
            print(f"  - {error}")
