#!/usr/bin/env python3
"""
Survey Analyzer Script for Guest Insights Engine

Statistical analysis of survey responses including crosstabs,
significance testing, and visualization specifications.

Author: Culver's Marketing Analytics Team
Version: 1.0.0
"""

import logging
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import json
import statistics
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ValidationError(Exception):
    pass


class InsufficientDataError(Exception):
    pass


class SignificanceLevel(Enum):
    HIGH = "highly_significant"  # p < 0.01
    STANDARD = "significant"     # p < 0.05
    MARGINAL = "marginal"        # p < 0.10
    NOT_SIGNIFICANT = "not_significant"


@dataclass
class ProcessingResult:
    success: bool
    data: Optional[Any] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CrosstabResult:
    row_variable: str
    col_variable: str
    table: Dict[str, Dict[str, float]]
    row_totals: Dict[str, int]
    col_totals: Dict[str, int]
    grand_total: int
    chi_square: float
    p_value: float
    significance: SignificanceLevel


def validate_survey_data(
    responses: List[Dict[str, Any]],
    required_fields: List[str] = None
) -> ProcessingResult:
    """Validate survey response data."""
    warnings = []
    errors = []
    validated = []

    if not responses:
        errors.append("No survey responses provided")
        return ProcessingResult(success=False, errors=errors)

    if len(responses) < 30:
        warnings.append(f"Sample size ({len(responses)}) is small for statistical analysis")

    for i, resp in enumerate(responses):
        if not isinstance(resp, dict):
            errors.append(f"Response {i+1}: Not a valid dictionary")
            continue

        if 'respondent_id' not in resp:
            resp['respondent_id'] = f"R{i+1}"

        validated.append(resp)

    return ProcessingResult(
        success=len(validated) > 0,
        data=validated,
        warnings=warnings,
        errors=errors,
        metadata={"valid_responses": len(validated)}
    )


def calculate_descriptive_stats(
    values: List[float]
) -> Dict[str, float]:
    """Calculate descriptive statistics for numeric values."""
    if not values:
        return {}

    n = len(values)
    sorted_vals = sorted(values)

    stats = {
        "n": n,
        "mean": statistics.mean(values),
        "median": statistics.median(values),
        "std_dev": statistics.stdev(values) if n > 1 else 0,
        "min": min(values),
        "max": max(values),
        "range": max(values) - min(values),
        "q1": sorted_vals[int(n * 0.25)] if n >= 4 else sorted_vals[0],
        "q3": sorted_vals[int(n * 0.75)] if n >= 4 else sorted_vals[-1]
    }

    # Standard error of mean
    if n > 1:
        stats["sem"] = stats["std_dev"] / math.sqrt(n)
        stats["ci_lower"] = stats["mean"] - 1.96 * stats["sem"]
        stats["ci_upper"] = stats["mean"] + 1.96 * stats["sem"]

    return stats


def calculate_frequency_distribution(
    values: List[Any]
) -> Dict[str, Dict[str, Any]]:
    """Calculate frequency distribution for categorical values."""
    if not values:
        return {}

    total = len(values)
    counts = {}
    for val in values:
        val_str = str(val)
        counts[val_str] = counts.get(val_str, 0) + 1

    distribution = {}
    for val, count in counts.items():
        distribution[val] = {
            "count": count,
            "percentage": round((count / total) * 100, 1)
        }

    return distribution


def calculate_crosstab(
    responses: List[Dict[str, Any]],
    row_var: str,
    col_var: str
) -> CrosstabResult:
    """Calculate crosstab with chi-square test."""
    # Extract values
    row_values = []
    col_values = []

    for resp in responses:
        if row_var in resp and col_var in resp:
            row_values.append(str(resp[row_var]))
            col_values.append(str(resp[col_var]))

    if len(row_values) < 30:
        raise InsufficientDataError(f"Need at least 30 responses, got {len(row_values)}")

    # Get unique values
    row_cats = sorted(set(row_values))
    col_cats = sorted(set(col_values))

    # Build contingency table
    observed = {r: {c: 0 for c in col_cats} for r in row_cats}
    for r, c in zip(row_values, col_values):
        observed[r][c] += 1

    # Calculate totals
    row_totals = {r: sum(observed[r].values()) for r in row_cats}
    col_totals = {c: sum(observed[r][c] for r in row_cats) for c in col_cats}
    grand_total = len(row_values)

    # Calculate expected values and chi-square
    chi_sq = 0
    for r in row_cats:
        for c in col_cats:
            expected = (row_totals[r] * col_totals[c]) / grand_total
            if expected > 0:
                chi_sq += ((observed[r][c] - expected) ** 2) / expected

    # Degrees of freedom
    df = (len(row_cats) - 1) * (len(col_cats) - 1)

    # Approximate p-value (simplified)
    # In practice, use scipy.stats.chi2.sf(chi_sq, df)
    if df == 1:
        critical_values = {3.84: 0.05, 6.63: 0.01, 10.83: 0.001}
    elif df == 2:
        critical_values = {5.99: 0.05, 9.21: 0.01, 13.82: 0.001}
    else:
        critical_values = {df * 1.5: 0.05, df * 2: 0.01, df * 3: 0.001}

    p_value = 0.5
    for cv, pv in sorted(critical_values.items()):
        if chi_sq >= cv:
            p_value = pv

    # Determine significance
    if p_value < 0.01:
        sig = SignificanceLevel.HIGH
    elif p_value < 0.05:
        sig = SignificanceLevel.STANDARD
    elif p_value < 0.10:
        sig = SignificanceLevel.MARGINAL
    else:
        sig = SignificanceLevel.NOT_SIGNIFICANT

    # Convert to percentages
    table_pct = {}
    for r in row_cats:
        table_pct[r] = {}
        for c in col_cats:
            if row_totals[r] > 0:
                table_pct[r][c] = round((observed[r][c] / row_totals[r]) * 100, 1)
            else:
                table_pct[r][c] = 0

    return CrosstabResult(
        row_variable=row_var,
        col_variable=col_var,
        table=table_pct,
        row_totals=row_totals,
        col_totals=col_totals,
        grand_total=grand_total,
        chi_square=round(chi_sq, 2),
        p_value=p_value,
        significance=sig
    )


def two_sample_proportion_test(
    n1: int, p1: float,
    n2: int, p2: float
) -> Tuple[float, float, SignificanceLevel]:
    """
    Two-sample z-test for proportions.

    Returns: (z_statistic, p_value, significance_level)
    """
    if n1 < 30 or n2 < 30:
        raise InsufficientDataError("Need at least 30 per group")

    # Pooled proportion
    p_pool = (n1 * p1 + n2 * p2) / (n1 + n2)

    # Standard error
    se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))

    if se == 0:
        return (0, 1.0, SignificanceLevel.NOT_SIGNIFICANT)

    # Z-statistic
    z = (p1 - p2) / se

    # Approximate p-value
    abs_z = abs(z)
    if abs_z >= 2.58:
        p_value = 0.01
        sig = SignificanceLevel.HIGH
    elif abs_z >= 1.96:
        p_value = 0.05
        sig = SignificanceLevel.STANDARD
    elif abs_z >= 1.645:
        p_value = 0.10
        sig = SignificanceLevel.MARGINAL
    else:
        p_value = 0.5
        sig = SignificanceLevel.NOT_SIGNIFICANT

    return (round(z, 2), p_value, sig)


def analyze_nps(
    responses: List[Dict[str, Any]],
    nps_field: str = "nps_score"
) -> Dict[str, Any]:
    """Analyze Net Promoter Score responses."""
    scores = []
    for resp in responses:
        if nps_field in resp:
            try:
                score = int(resp[nps_field])
                if 0 <= score <= 10:
                    scores.append(score)
            except (ValueError, TypeError):
                continue

    if not scores:
        return {"error": "No valid NPS scores found"}

    promoters = sum(1 for s in scores if s >= 9)
    passives = sum(1 for s in scores if 7 <= s <= 8)
    detractors = sum(1 for s in scores if s <= 6)
    total = len(scores)

    nps = ((promoters - detractors) / total) * 100

    return {
        "nps_score": round(nps, 1),
        "promoters": {
            "count": promoters,
            "percentage": round((promoters / total) * 100, 1)
        },
        "passives": {
            "count": passives,
            "percentage": round((passives / total) * 100, 1)
        },
        "detractors": {
            "count": detractors,
            "percentage": round((detractors / total) * 100, 1)
        },
        "total_responses": total,
        "average_score": round(statistics.mean(scores), 2),
        "interpretation": get_nps_interpretation(nps)
    }


def get_nps_interpretation(nps: float) -> str:
    """Get interpretation of NPS score."""
    if nps >= 70:
        return "Excellent - World-class customer loyalty"
    elif nps >= 50:
        return "Great - Strong customer loyalty"
    elif nps >= 30:
        return "Good - More promoters than detractors"
    elif nps >= 0:
        return "Needs improvement - Balanced but room to grow"
    else:
        return "Critical - More detractors than promoters"


def analyze_survey(
    responses: List[Dict[str, Any]],
    questions: List[Dict[str, str]] = None
) -> ProcessingResult:
    """
    Comprehensive survey analysis.

    Args:
        responses: Survey response data
        questions: Question definitions with types

    Returns:
        ProcessingResult with analysis
    """
    logger.info("Starting survey analysis")

    validation = validate_survey_data(responses)
    if not validation.success:
        return validation

    validated = validation.data

    analysis = {
        "analysis_date": datetime.now().isoformat(),
        "total_responses": len(validated),
        "completion_rate": 100.0,
        "field_summaries": {},
        "crosstabs": [],
        "nps_analysis": None,
        "recommendations": []
    }

    # Analyze each field
    all_fields = set()
    for resp in validated:
        all_fields.update(resp.keys())

    for field in all_fields:
        if field in ['respondent_id', 'timestamp']:
            continue

        values = [resp.get(field) for resp in validated if resp.get(field) is not None]

        if not values:
            continue

        # Check if numeric
        try:
            numeric_values = [float(v) for v in values]
            analysis["field_summaries"][field] = {
                "type": "numeric",
                "stats": calculate_descriptive_stats(numeric_values)
            }
        except (ValueError, TypeError):
            analysis["field_summaries"][field] = {
                "type": "categorical",
                "distribution": calculate_frequency_distribution(values)
            }

    # Check for NPS
    for field in ['nps', 'nps_score', 'recommend_score']:
        if field in all_fields:
            analysis["nps_analysis"] = analyze_nps(validated, field)
            break

    # Generate recommendations
    analysis["recommendations"] = generate_survey_recommendations(analysis)

    return ProcessingResult(
        success=True,
        data=analysis,
        warnings=validation.warnings,
        metadata=validation.metadata
    )


def generate_survey_recommendations(analysis: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on survey analysis."""
    recommendations = []

    if analysis["total_responses"] < 100:
        recommendations.append(
            "Consider increasing sample size for more reliable results"
        )

    if analysis.get("nps_analysis"):
        nps = analysis["nps_analysis"].get("nps_score", 0)
        if nps < 30:
            recommendations.append(
                f"NPS of {nps:.0f} indicates opportunity to improve customer experience"
            )
        elif nps >= 50:
            recommendations.append(
                f"Strong NPS of {nps:.0f} - leverage promoters for referral programs"
            )

    return recommendations


if __name__ == "__main__":
    # Sample data
    sample_responses = [
        {"respondent_id": f"R{i}", "age_group": "25-34" if i % 2 else "35-44",
         "satisfaction": 4 + (i % 2), "nps_score": 7 + (i % 4),
         "visit_frequency": "weekly" if i % 3 == 0 else "monthly"}
        for i in range(100)
    ]

    result = analyze_survey(sample_responses)
    if result.success:
        print(json.dumps(result.data, indent=2, default=str))
