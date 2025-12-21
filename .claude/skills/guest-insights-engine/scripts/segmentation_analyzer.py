#!/usr/bin/env python3
"""
Segmentation Analyzer Script for Guest Insights Engine

Processes guest data for behavioral and attitudinal segmentation,
generates segment profiles, and provides statistical validation.

Author: Culver's Marketing Analytics Team
Version: 1.0.0
"""

import logging
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, date, timedelta
import json
import statistics
import math

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


class SegmentationType(Enum):
    """Types of segmentation"""
    RFM = "rfm"
    BEHAVIORAL = "behavioral"
    ATTITUDINAL = "attitudinal"
    HYBRID = "hybrid"


@dataclass
class ProcessingResult:
    """Standard result container"""
    success: bool
    data: Optional[Any] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GuestRecord:
    """Individual guest record"""
    guest_id: str
    recency_days: int
    frequency: float
    monetary: float
    preferred_daypart: str = "lunch"
    preferred_channel: str = "drive_thru"
    avg_ticket: float = 0.0
    tenure_months: int = 12
    satisfaction_score: Optional[float] = None


@dataclass
class RFMScore:
    """RFM scoring for a guest"""
    guest_id: str
    recency_score: int
    frequency_score: int
    monetary_score: int
    total_score: int
    segment_name: str


@dataclass
class SegmentProfile:
    """Complete segment profile"""
    segment_id: str
    segment_name: str
    size: int
    size_percentage: float
    revenue_share: float
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    avg_ticket: float
    primary_daypart: str
    primary_channel: str
    avg_satisfaction: Optional[float]
    characteristics: List[str]
    recommendations: List[str]


# RFM Segment Definitions
RFM_SEGMENTS = {
    (5, 5, 5): ("Champions", "Best guests - recent, frequent, high spend"),
    (5, 5, 4): ("Champions", "Best guests - recent, frequent, good spend"),
    (5, 4, 5): ("Loyal Customers", "Very loyal, recent with high spend"),
    (5, 4, 4): ("Loyal Customers", "Regular loyal guests"),
    (4, 5, 5): ("Loyal Customers", "Frequent, high spenders"),
    (5, 3, 3): ("Potential Loyalists", "Recent guests with growth potential"),
    (4, 4, 4): ("Potential Loyalists", "Good across all dimensions"),
    (4, 3, 4): ("Potential Loyalists", "Moderate frequency, good value"),
    (3, 4, 4): ("At Risk", "Were loyal, becoming less recent"),
    (3, 3, 4): ("At Risk", "Declining engagement"),
    (2, 4, 4): ("At Risk", "Previously loyal, now lapsing"),
    (2, 2, 3): ("Hibernating", "Low engagement across dimensions"),
    (2, 2, 2): ("Hibernating", "Very low engagement"),
    (1, 2, 2): ("Lost", "Churned or nearly churned"),
    (1, 1, 1): ("Lost", "Completely disengaged"),
}


def validate_guest_data(
    data: List[Dict[str, Any]],
    required_fields: List[str] = None
) -> ProcessingResult:
    """
    Validate guest data for segmentation analysis.

    Args:
        data: List of guest records
        required_fields: Required field names

    Returns:
        ProcessingResult with validation status
    """
    if required_fields is None:
        required_fields = ['guest_id', 'recency_days', 'frequency', 'monetary']

    warnings = []
    errors = []
    validated_data = []

    if not data:
        errors.append("No guest data provided")
        return ProcessingResult(
            success=False,
            data=None,
            warnings=warnings,
            errors=errors,
            metadata={"rows_processed": 0}
        )

    # Check minimum sample size
    if len(data) < 100:
        warnings.append(
            f"Sample size ({len(data)}) is below recommended minimum of 100 for reliable segmentation"
        )

    seen_ids = set()
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

        # Check for duplicates
        guest_id = str(record['guest_id'])
        if guest_id in seen_ids:
            record_warnings.append(f"Row {i+1}: Duplicate guest_id '{guest_id}'")
        seen_ids.add(guest_id)

        # Validate numeric fields
        try:
            recency = int(record['recency_days'])
            if recency < 0:
                record_errors.append(f"Row {i+1}: recency_days cannot be negative")
            elif recency > 730:
                record_warnings.append(f"Row {i+1}: Very old recency ({recency} days)")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid recency_days value")

        try:
            frequency = float(record['frequency'])
            if frequency < 0:
                record_errors.append(f"Row {i+1}: frequency cannot be negative")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid frequency value")

        try:
            monetary = float(record['monetary'])
            if monetary < 0:
                record_errors.append(f"Row {i+1}: monetary cannot be negative")
        except (ValueError, TypeError):
            record_errors.append(f"Row {i+1}: Invalid monetary value")

        # Check for outliers
        if not record_errors:
            if frequency > 100:
                record_warnings.append(
                    f"Row {i+1}: Unusually high frequency ({frequency}), verify data"
                )
            if monetary > 10000:
                record_warnings.append(
                    f"Row {i+1}: Unusually high monetary ({monetary}), verify data"
                )

        warnings.extend(record_warnings)
        errors.extend(record_errors)

        if not record_errors:
            validated_data.append(record)

    # Check for skewed distributions
    if validated_data:
        frequencies = [float(r['frequency']) for r in validated_data]
        monetaries = [float(r['monetary']) for r in validated_data]

        freq_mean = statistics.mean(frequencies)
        freq_median = statistics.median(frequencies)
        if freq_mean > freq_median * 3:
            warnings.append(
                "Frequency distribution is highly skewed - consider log transformation"
            )

        mon_mean = statistics.mean(monetaries)
        mon_median = statistics.median(monetaries)
        if mon_mean > mon_median * 3:
            warnings.append(
                "Monetary distribution is highly skewed - consider log transformation"
            )

    success = len(validated_data) >= 30  # Minimum for any analysis

    return ProcessingResult(
        success=success,
        data=validated_data,
        warnings=warnings,
        errors=errors,
        metadata={
            "rows_processed": len(data),
            "rows_valid": len(validated_data),
            "rows_invalid": len(data) - len(validated_data),
            "unique_guests": len(seen_ids)
        }
    )


def calculate_rfm_scores(
    guests: List[Dict[str, Any]]
) -> List[RFMScore]:
    """
    Calculate RFM scores for each guest using quintile-based scoring.

    Args:
        guests: List of guest records with recency, frequency, monetary

    Returns:
        List of RFMScore objects
    """
    if not guests:
        raise InsufficientDataError("No guest data for RFM scoring")

    # Extract values
    recencies = sorted([int(g['recency_days']) for g in guests])
    frequencies = sorted([float(g['frequency']) for g in guests])
    monetaries = sorted([float(g['monetary']) for g in guests])

    # Calculate quintile boundaries
    def get_quintiles(values: List[float]) -> List[float]:
        n = len(values)
        return [
            values[int(n * 0.2)],
            values[int(n * 0.4)],
            values[int(n * 0.6)],
            values[int(n * 0.8)]
        ]

    recency_quintiles = get_quintiles(recencies)
    frequency_quintiles = get_quintiles(frequencies)
    monetary_quintiles = get_quintiles(monetaries)

    # Score each guest
    def score_value(value: float, quintiles: List[float], inverse: bool = False) -> int:
        """Assign 1-5 score based on quintile. Inverse for recency (lower is better)."""
        if inverse:
            if value <= quintiles[0]:
                return 5
            elif value <= quintiles[1]:
                return 4
            elif value <= quintiles[2]:
                return 3
            elif value <= quintiles[3]:
                return 2
            else:
                return 1
        else:
            if value <= quintiles[0]:
                return 1
            elif value <= quintiles[1]:
                return 2
            elif value <= quintiles[2]:
                return 3
            elif value <= quintiles[3]:
                return 4
            else:
                return 5

    rfm_scores = []
    for guest in guests:
        r_score = score_value(int(guest['recency_days']), recency_quintiles, inverse=True)
        f_score = score_value(float(guest['frequency']), frequency_quintiles)
        m_score = score_value(float(guest['monetary']), monetary_quintiles)
        total = r_score + f_score + m_score

        # Get segment name
        segment_key = (r_score, f_score, m_score)
        segment_info = RFM_SEGMENTS.get(segment_key)
        if segment_info:
            segment_name = segment_info[0]
        else:
            # Assign based on total score
            if total >= 13:
                segment_name = "Champions"
            elif total >= 10:
                segment_name = "Loyal Customers"
            elif total >= 7:
                segment_name = "Potential Loyalists"
            elif total >= 5:
                segment_name = "At Risk"
            elif total >= 3:
                segment_name = "Hibernating"
            else:
                segment_name = "Lost"

        rfm_scores.append(RFMScore(
            guest_id=str(guest['guest_id']),
            recency_score=r_score,
            frequency_score=f_score,
            monetary_score=m_score,
            total_score=total,
            segment_name=segment_name
        ))

    return rfm_scores


def generate_segment_profiles(
    guests: List[Dict[str, Any]],
    rfm_scores: List[RFMScore]
) -> List[SegmentProfile]:
    """
    Generate detailed segment profiles from RFM analysis.

    Args:
        guests: Original guest records
        rfm_scores: Calculated RFM scores

    Returns:
        List of SegmentProfile objects
    """
    # Create lookup for guest data
    guest_lookup = {str(g['guest_id']): g for g in guests}

    # Group by segment
    segment_groups = {}
    for score in rfm_scores:
        segment = score.segment_name
        if segment not in segment_groups:
            segment_groups[segment] = []
        segment_groups[segment].append(score)

    total_guests = len(guests)
    total_revenue = sum(float(g['monetary']) for g in guests)

    profiles = []
    for segment_name, scores in segment_groups.items():
        segment_guests = [guest_lookup[s.guest_id] for s in scores if s.guest_id in guest_lookup]

        if not segment_guests:
            continue

        size = len(segment_guests)
        size_pct = (size / total_guests) * 100
        revenue = sum(float(g['monetary']) for g in segment_guests)
        revenue_share = (revenue / total_revenue * 100) if total_revenue > 0 else 0

        # Calculate averages
        avg_recency = statistics.mean([int(g['recency_days']) for g in segment_guests])
        avg_frequency = statistics.mean([float(g['frequency']) for g in segment_guests])
        avg_monetary = statistics.mean([float(g['monetary']) for g in segment_guests])
        avg_ticket = statistics.mean([float(g.get('avg_ticket', avg_monetary / max(float(g['frequency']), 1))) for g in segment_guests])

        # Get mode for categorical fields
        dayparts = [g.get('preferred_daypart', 'lunch') for g in segment_guests]
        channels = [g.get('preferred_channel', 'drive_thru') for g in segment_guests]
        primary_daypart = max(set(dayparts), key=dayparts.count)
        primary_channel = max(set(channels), key=channels.count)

        # Calculate satisfaction if available
        sat_scores = [float(g['satisfaction_score']) for g in segment_guests
                     if g.get('satisfaction_score') is not None]
        avg_satisfaction = statistics.mean(sat_scores) if sat_scores else None

        # Generate characteristics
        characteristics = generate_segment_characteristics(
            segment_name, avg_recency, avg_frequency, avg_monetary, avg_ticket
        )

        # Generate recommendations
        recommendations = generate_segment_recommendations(segment_name)

        profile = SegmentProfile(
            segment_id=segment_name.lower().replace(' ', '_'),
            segment_name=segment_name,
            size=size,
            size_percentage=round(size_pct, 1),
            revenue_share=round(revenue_share, 1),
            avg_recency=round(avg_recency, 1),
            avg_frequency=round(avg_frequency, 2),
            avg_monetary=round(avg_monetary, 2),
            avg_ticket=round(avg_ticket, 2),
            primary_daypart=primary_daypart,
            primary_channel=primary_channel,
            avg_satisfaction=round(avg_satisfaction, 2) if avg_satisfaction else None,
            characteristics=characteristics,
            recommendations=recommendations
        )
        profiles.append(profile)

    # Sort by revenue share descending
    profiles.sort(key=lambda p: p.revenue_share, reverse=True)

    return profiles


def generate_segment_characteristics(
    segment_name: str,
    avg_recency: float,
    avg_frequency: float,
    avg_monetary: float,
    avg_ticket: float
) -> List[str]:
    """Generate descriptive characteristics for a segment."""
    characteristics = []

    if segment_name == "Champions":
        characteristics = [
            "Most valuable guests with highest engagement",
            f"Visit every {avg_recency:.0f} days on average",
            f"High frequency ({avg_frequency:.1f} visits/month)",
            f"Premium ticket size (${avg_ticket:.2f})",
            "Brand advocates and repeat purchasers"
        ]
    elif segment_name == "Loyal Customers":
        characteristics = [
            "Consistent, reliable guest base",
            f"Regular visit pattern ({avg_frequency:.1f}/month)",
            f"Solid spend level (${avg_monetary:.2f} total)",
            "Good candidates for loyalty program upgrades",
            "Respond well to recognition"
        ]
    elif segment_name == "Potential Loyalists":
        characteristics = [
            "Growing engagement with brand",
            f"Recent visits ({avg_recency:.0f} days ago)",
            f"Developing frequency ({avg_frequency:.1f}/month)",
            "High potential for increased visits",
            "Receptive to promotional offers"
        ]
    elif segment_name == "At Risk":
        characteristics = [
            "Previously engaged but declining",
            f"Increasing time between visits ({avg_recency:.0f} days)",
            f"Decreasing frequency trend",
            "May be exploring competitors",
            "Requires immediate attention"
        ]
    elif segment_name == "Hibernating":
        characteristics = [
            "Very low recent engagement",
            f"Long time since last visit ({avg_recency:.0f} days)",
            f"Minimal frequency ({avg_frequency:.1f}/month)",
            "May need strong incentive to return",
            "At risk of permanent churn"
        ]
    else:  # Lost
        characteristics = [
            "Essentially churned guests",
            f"Extended absence ({avg_recency:.0f}+ days)",
            "Minimal to no recent activity",
            "May require re-acquisition tactics",
            "Consider suppression for efficiency"
        ]

    return characteristics


def generate_segment_recommendations(segment_name: str) -> List[str]:
    """Generate marketing recommendations for a segment."""
    recommendations = {
        "Champions": [
            "Enroll in VIP/ambassador program",
            "Exclusive early access to new menu items",
            "Personalized thank you communications",
            "Referral program incentives",
            "Surprise and delight moments"
        ],
        "Loyal Customers": [
            "Maintain regular engagement cadence",
            "Offer loyalty tier upgrades",
            "Cross-sell underutilized dayparts",
            "Personalized recommendations based on history",
            "Birthday and anniversary recognition"
        ],
        "Potential Loyalists": [
            "Increase visit frequency with time-limited offers",
            "Encourage mobile app adoption",
            "Introduce to loyalty program benefits",
            "Expand category trial with combo deals",
            "Targeted offers for second visit this week"
        ],
        "At Risk": [
            "Immediate win-back campaign required",
            "Strong value offers to re-engage",
            "Feedback survey to understand barriers",
            "Personalized 'we miss you' messaging",
            "Consider competitive intelligence"
        ],
        "Hibernating": [
            "Deep discount win-back offer",
            "Reminder of brand and favorite items",
            "Limited-time exclusive comeback offer",
            "Consider cost-effective reactivation channels",
            "Set timeline for suppression if no response"
        ],
        "Lost": [
            "Final win-back attempt with significant offer",
            "Low-cost reactivation (email/push only)",
            "Consider suppression after final attempt",
            "Focus budget on higher-potential segments",
            "Analyze for churn prediction insights"
        ]
    }
    return recommendations.get(segment_name, ["Develop custom strategy for this segment"])


def run_segmentation_analysis(
    guest_data: List[Dict[str, Any]],
    segmentation_type: str = "rfm"
) -> ProcessingResult:
    """
    Run complete segmentation analysis on guest data.

    Args:
        guest_data: List of guest records
        segmentation_type: Type of segmentation to perform

    Returns:
        ProcessingResult containing segmentation analysis
    """
    logger.info(f"Starting {segmentation_type} segmentation analysis")

    # Validate data
    validation = validate_guest_data(guest_data)
    if not validation.success:
        logger.error(f"Validation failed: {validation.errors}")
        return validation

    validated_data = validation.data

    try:
        # Calculate RFM scores
        rfm_scores = calculate_rfm_scores(validated_data)

        # Generate segment profiles
        profiles = generate_segment_profiles(validated_data, rfm_scores)

        # Calculate migration analysis (if historical data available)
        segment_distribution = {}
        for profile in profiles:
            segment_distribution[profile.segment_name] = {
                "size": profile.size,
                "percentage": profile.size_percentage,
                "revenue_share": profile.revenue_share
            }

        # Compile results
        analysis_result = {
            "analysis_date": datetime.now().isoformat(),
            "segmentation_type": segmentation_type,
            "total_guests": len(validated_data),
            "segments_identified": len(profiles),
            "segment_distribution": segment_distribution,
            "segment_profiles": [
                {
                    "segment_id": p.segment_id,
                    "segment_name": p.segment_name,
                    "size": p.size,
                    "size_percentage": p.size_percentage,
                    "revenue_share": p.revenue_share,
                    "avg_recency": p.avg_recency,
                    "avg_frequency": p.avg_frequency,
                    "avg_monetary": p.avg_monetary,
                    "avg_ticket": p.avg_ticket,
                    "primary_daypart": p.primary_daypart,
                    "primary_channel": p.primary_channel,
                    "avg_satisfaction": p.avg_satisfaction,
                    "characteristics": p.characteristics,
                    "recommendations": p.recommendations
                }
                for p in profiles
            ],
            "guest_segment_assignments": [
                {
                    "guest_id": s.guest_id,
                    "rfm_scores": {
                        "recency": s.recency_score,
                        "frequency": s.frequency_score,
                        "monetary": s.monetary_score,
                        "total": s.total_score
                    },
                    "segment": s.segment_name
                }
                for s in rfm_scores
            ],
            "statistical_validation": {
                "minimum_sample_met": len(validated_data) >= 100,
                "sample_size": len(validated_data),
                "segments_with_adequate_size": sum(1 for p in profiles if p.size >= 30),
                "revenue_concentration": max(p.revenue_share for p in profiles) if profiles else 0
            }
        }

        logger.info(f"Segmentation complete: {len(profiles)} segments identified")

        return ProcessingResult(
            success=True,
            data=analysis_result,
            warnings=validation.warnings,
            errors=[],
            metadata={
                **validation.metadata,
                "segments_created": len(profiles)
            }
        )

    except Exception as e:
        logger.error(f"Segmentation analysis failed: {str(e)}")
        return ProcessingResult(
            success=False,
            data=None,
            warnings=validation.warnings,
            errors=[f"Analysis error: {str(e)}"],
            metadata=validation.metadata
        )


def format_segmentation_report(analysis: Dict[str, Any]) -> str:
    """Format segmentation analysis as readable text report."""
    lines = [
        "=" * 80,
        "GUEST SEGMENTATION ANALYSIS",
        f"Analysis Date: {analysis['analysis_date'][:10]}",
        f"Total Guests: {analysis['total_guests']:,}",
        "=" * 80,
        "",
        "SEGMENT OVERVIEW",
        "-" * 40,
    ]

    # Segment summary table
    header = f"{'Segment':<20} {'Size':>8} {'%':>6} {'Revenue%':>10} {'Avg Freq':>10}"
    lines.append(header)
    lines.append("-" * len(header))

    for profile in analysis['segment_profiles']:
        lines.append(
            f"{profile['segment_name']:<20} "
            f"{profile['size']:>8,} "
            f"{profile['size_percentage']:>5.1f}% "
            f"{profile['revenue_share']:>9.1f}% "
            f"{profile['avg_frequency']:>10.2f}"
        )

    # Detailed profiles
    lines.extend([
        "",
        "SEGMENT PROFILES",
        "-" * 40,
    ])

    for profile in analysis['segment_profiles']:
        lines.extend([
            f"\n### {profile['segment_name']}",
            f"Size: {profile['size']:,} guests ({profile['size_percentage']}%)",
            f"Revenue Share: {profile['revenue_share']}%",
            f"Avg Recency: {profile['avg_recency']:.0f} days",
            f"Avg Frequency: {profile['avg_frequency']:.2f} visits/month",
            f"Avg Ticket: ${profile['avg_ticket']:.2f}",
            f"Primary Daypart: {profile['primary_daypart']}",
            f"Primary Channel: {profile['primary_channel']}",
            "",
            "Characteristics:",
        ])
        for char in profile['characteristics']:
            lines.append(f"  - {char}")

        lines.append("\nRecommendations:")
        for rec in profile['recommendations']:
            lines.append(f"  - {rec}")

    # Statistical validation
    lines.extend([
        "",
        "STATISTICAL VALIDATION",
        "-" * 40,
        f"Sample Size: {analysis['statistical_validation']['sample_size']:,}",
        f"Minimum Sample Met: {'Yes' if analysis['statistical_validation']['minimum_sample_met'] else 'No'}",
        f"Segments with Adequate Size (30+): {analysis['statistical_validation']['segments_with_adequate_size']}",
        f"Revenue Concentration: {analysis['statistical_validation']['revenue_concentration']:.1f}%",
    ])

    lines.append("")
    lines.append("=" * 80)

    return "\n".join(lines)


if __name__ == "__main__":
    # Example usage with sample data
    import random

    sample_guests = []
    for i in range(500):
        sample_guests.append({
            "guest_id": f"G{i:05d}",
            "recency_days": random.randint(1, 365),
            "frequency": round(random.uniform(0.5, 15), 2),
            "monetary": round(random.uniform(20, 500), 2),
            "avg_ticket": round(random.uniform(8, 25), 2),
            "preferred_daypart": random.choice(["breakfast", "lunch", "dinner", "snack"]),
            "preferred_channel": random.choice(["drive_thru", "dine_in", "mobile", "delivery"]),
            "satisfaction_score": round(random.uniform(3, 5), 1)
        })

    result = run_segmentation_analysis(sample_guests)

    if result.success:
        print(format_segmentation_report(result.data))
    else:
        print("Analysis failed:")
        for error in result.errors:
            print(f"  - {error}")
