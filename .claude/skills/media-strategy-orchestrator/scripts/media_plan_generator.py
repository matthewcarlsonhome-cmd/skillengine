#!/usr/bin/env python3
"""
Media Plan Generator Script for Media Strategy Orchestrator

Generates media plan frameworks based on objectives, budget, and target audience.

Author: Culver's Marketing Analytics Team
Version: 1.0.0
"""

import logging
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, date, timedelta
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


class CampaignObjective(Enum):
    """Campaign objective types"""
    AWARENESS = "awareness"
    CONSIDERATION = "consideration"
    TRAFFIC = "traffic"
    CONVERSION = "conversion"
    LOYALTY = "loyalty"
    LTO_LAUNCH = "lto_launch"
    NEW_RESTAURANT = "new_restaurant"


class ChannelRole(Enum):
    """Role of channel in media mix"""
    PRIMARY = "primary"
    SECONDARY = "secondary"
    SUPPORT = "support"
    TEST = "test"


@dataclass
class ProcessingResult:
    """Standard result container"""
    success: bool
    data: Optional[Any] = None
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChannelAllocation:
    """Channel budget allocation"""
    channel: str
    role: ChannelRole
    budget: float
    budget_percentage: float
    rationale: str
    kpis: List[str]
    tactics: List[str]


@dataclass
class MediaPlan:
    """Complete media plan structure"""
    campaign_name: str
    objective: CampaignObjective
    total_budget: float
    start_date: date
    end_date: date
    target_audience: Dict[str, Any]
    channel_allocations: List[ChannelAllocation]
    flight_schedule: List[Dict[str, Any]]
    kpi_targets: Dict[str, float]
    creative_requirements: List[Dict[str, Any]]
    measurement_plan: Dict[str, Any]


# Channel recommendation templates by objective
OBJECTIVE_CHANNEL_MIX = {
    CampaignObjective.AWARENESS: {
        "primary": ["TV", "CTV/OTT", "Digital Video"],
        "secondary": ["OOH", "Audio", "Paid Social"],
        "support": ["Display"],
        "allocation_guide": {
            "TV": (0.30, 0.45),
            "CTV/OTT": (0.15, 0.25),
            "Digital Video": (0.10, 0.20),
            "OOH": (0.05, 0.15),
            "Audio": (0.05, 0.10),
            "Paid Social": (0.05, 0.15),
            "Display": (0.02, 0.08)
        }
    },
    CampaignObjective.TRAFFIC: {
        "primary": ["Paid Search", "Paid Social"],
        "secondary": ["Display", "CTV/OTT"],
        "support": ["Audio", "OOH"],
        "allocation_guide": {
            "Paid Search": (0.30, 0.45),
            "Paid Social": (0.25, 0.35),
            "Display": (0.10, 0.20),
            "CTV/OTT": (0.05, 0.15),
            "Audio": (0.02, 0.08),
            "OOH": (0.02, 0.08)
        }
    },
    CampaignObjective.CONVERSION: {
        "primary": ["Paid Search", "Paid Social"],
        "secondary": ["Display", "Email"],
        "support": ["CTV/OTT"],
        "allocation_guide": {
            "Paid Search": (0.35, 0.50),
            "Paid Social": (0.20, 0.35),
            "Display": (0.10, 0.20),
            "Email": (0.05, 0.10),
            "CTV/OTT": (0.02, 0.08)
        }
    },
    CampaignObjective.LTO_LAUNCH: {
        "primary": ["TV", "Paid Social", "CTV/OTT"],
        "secondary": ["Paid Search", "Digital Video", "OOH"],
        "support": ["Display", "Audio", "Email"],
        "allocation_guide": {
            "TV": (0.25, 0.40),
            "Paid Social": (0.15, 0.25),
            "CTV/OTT": (0.10, 0.20),
            "Paid Search": (0.10, 0.15),
            "Digital Video": (0.05, 0.15),
            "OOH": (0.05, 0.10),
            "Display": (0.02, 0.08),
            "Audio": (0.02, 0.08),
            "Email": (0.02, 0.05)
        }
    },
    CampaignObjective.NEW_RESTAURANT: {
        "primary": ["OOH", "Paid Social", "Paid Search"],
        "secondary": ["Display", "Audio"],
        "support": ["Direct Mail", "Local Events"],
        "allocation_guide": {
            "OOH": (0.25, 0.40),
            "Paid Social": (0.20, 0.30),
            "Paid Search": (0.15, 0.25),
            "Display": (0.10, 0.20),
            "Audio": (0.05, 0.15),
            "Direct Mail": (0.05, 0.10),
            "Local Events": (0.02, 0.08)
        }
    }
}

# QSR benchmark KPIs by channel
CHANNEL_KPIS = {
    "TV": {
        "target_cpm": 15.0,
        "target_reach": 70,
        "target_frequency": 3.0,
        "kpis": ["GRPs", "Reach", "Frequency", "CPP", "CPM"]
    },
    "CTV/OTT": {
        "target_cpm": 25.0,
        "target_vcr": 85,
        "target_reach": 40,
        "kpis": ["Impressions", "Reach", "VCR", "CPM", "CPCV"]
    },
    "Paid Social": {
        "target_cpm": 10.0,
        "target_ctr": 1.0,
        "target_engagement": 3.0,
        "kpis": ["Impressions", "Reach", "CTR", "Engagement Rate", "CPM", "CPC"]
    },
    "Paid Search": {
        "target_cpc": 0.75,
        "target_ctr": 5.0,
        "target_cvr": 4.0,
        "kpis": ["Impressions", "Clicks", "CTR", "CPC", "Conversions", "CVR", "CPA"]
    },
    "Display": {
        "target_cpm": 5.0,
        "target_ctr": 0.1,
        "target_viewability": 70,
        "kpis": ["Impressions", "Viewability", "CTR", "CPM", "Conversions"]
    },
    "OOH": {
        "target_cpm": 3.0,
        "target_reach": 60,
        "kpis": ["Impressions", "Reach", "Frequency", "CPM"]
    },
    "Audio": {
        "target_cpm": 8.0,
        "target_completion": 95,
        "kpis": ["Impressions", "Completion Rate", "CPM", "Reach"]
    }
}


def validate_plan_inputs(
    objective: str,
    budget: float,
    start_date: str,
    end_date: str,
    target_audience: Dict[str, Any] = None
) -> ProcessingResult:
    """
    Validate media plan input parameters.

    Args:
        objective: Campaign objective string
        budget: Total campaign budget
        start_date: Campaign start date string
        end_date: Campaign end date string
        target_audience: Target audience definition

    Returns:
        ProcessingResult with validation status
    """
    warnings = []
    errors = []

    # Validate objective
    valid_objectives = [o.value for o in CampaignObjective]
    if objective.lower() not in valid_objectives:
        errors.append(
            f"Invalid objective '{objective}'. "
            f"Valid options: {', '.join(valid_objectives)}"
        )

    # Validate budget
    try:
        budget = float(budget)
        if budget <= 0:
            errors.append("Budget must be positive")
        elif budget < 10000:
            warnings.append(
                "Budget under $10,000 may limit channel options and effectiveness"
            )
    except (ValueError, TypeError):
        errors.append(f"Invalid budget value: {budget}")

    # Validate dates
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()

        if start >= end:
            errors.append("Start date must be before end date")

        if start < date.today():
            warnings.append("Start date is in the past")

        campaign_length = (end - start).days
        if campaign_length < 7:
            warnings.append("Campaign duration under 7 days may limit optimization")
        elif campaign_length > 365:
            warnings.append("Consider breaking into quarterly plans for campaigns over 1 year")

    except ValueError as e:
        errors.append(f"Invalid date format. Use YYYY-MM-DD. Error: {str(e)}")

    # Validate target audience if provided
    if target_audience:
        required_audience_fields = ['age_range', 'geography']
        missing = [f for f in required_audience_fields if f not in target_audience]
        if missing:
            warnings.append(f"Target audience missing recommended fields: {', '.join(missing)}")

    return ProcessingResult(
        success=len(errors) == 0,
        data=None,
        warnings=warnings,
        errors=errors,
        metadata={}
    )


def calculate_channel_allocation(
    objective: CampaignObjective,
    budget: float,
    constraints: Dict[str, Any] = None
) -> List[ChannelAllocation]:
    """
    Calculate recommended channel allocation based on objective.

    Args:
        objective: Campaign objective
        budget: Total budget
        constraints: Optional channel constraints (min/max per channel)

    Returns:
        List of ChannelAllocation objects
    """
    if constraints is None:
        constraints = {}

    channel_mix = OBJECTIVE_CHANNEL_MIX.get(objective, OBJECTIVE_CHANNEL_MIX[CampaignObjective.AWARENESS])
    allocations = []

    # Get allocation guides
    allocation_guide = channel_mix.get("allocation_guide", {})

    # Calculate allocations using midpoint of ranges
    remaining_budget = budget
    for channel, (min_pct, max_pct) in allocation_guide.items():
        # Check for constraints
        if channel in constraints:
            if constraints[channel].get("exclude", False):
                continue
            min_pct = constraints[channel].get("min_pct", min_pct)
            max_pct = constraints[channel].get("max_pct", max_pct)

        # Use midpoint of range
        target_pct = (min_pct + max_pct) / 2
        channel_budget = budget * target_pct

        # Determine role
        if channel in channel_mix.get("primary", []):
            role = ChannelRole.PRIMARY
        elif channel in channel_mix.get("secondary", []):
            role = ChannelRole.SECONDARY
        elif channel in channel_mix.get("support", []):
            role = ChannelRole.SUPPORT
        else:
            role = ChannelRole.TEST

        # Get channel KPIs
        channel_kpis = CHANNEL_KPIS.get(channel, {})
        kpis = channel_kpis.get("kpis", ["Impressions", "CPM"])

        # Generate tactics based on channel and objective
        tactics = generate_channel_tactics(channel, objective)

        # Generate rationale
        rationale = generate_allocation_rationale(channel, role, objective)

        allocation = ChannelAllocation(
            channel=channel,
            role=role,
            budget=round(channel_budget, 2),
            budget_percentage=round(target_pct * 100, 1),
            rationale=rationale,
            kpis=kpis,
            tactics=tactics
        )
        allocations.append(allocation)

    return allocations


def generate_channel_tactics(channel: str, objective: CampaignObjective) -> List[str]:
    """Generate recommended tactics for a channel."""
    tactics_map = {
        "TV": {
            CampaignObjective.AWARENESS: [
                "Prime time placement for maximum reach",
                "Sports programming for family audience",
                "News dayparts for credibility"
            ],
            CampaignObjective.LTO_LAUNCH: [
                "Heavy-up first two weeks for launch impact",
                "Daypart rotation matching menu item occasion",
                "Tentpole programming for buzz"
            ]
        },
        "Paid Social": {
            CampaignObjective.AWARENESS: [
                "Video-first creative strategy",
                "Broad targeting with lookalike expansion",
                "Story and Reels placements"
            ],
            CampaignObjective.TRAFFIC: [
                "Link click optimization",
                "Location-based targeting",
                "Carousel creative for menu showcase"
            ],
            CampaignObjective.CONVERSION: [
                "Conversion optimization (app install, order)",
                "Retargeting website visitors",
                "Dynamic product ads"
            ]
        },
        "Paid Search": {
            CampaignObjective.TRAFFIC: [
                "Brand terms protection",
                "Non-brand category expansion",
                "Location extensions for directions"
            ],
            CampaignObjective.CONVERSION: [
                "High-intent keyword focus",
                "Responsive search ads",
                "Call extensions for phone orders"
            ]
        },
        "OOH": {
            CampaignObjective.AWARENESS: [
                "Highway billboards for reach",
                "Urban transit for frequency"
            ],
            CampaignObjective.NEW_RESTAURANT: [
                "Directional signage near new location",
                "Grand opening countdown boards",
                "Local transit domination"
            ]
        }
    }

    channel_tactics = tactics_map.get(channel, {})
    return channel_tactics.get(objective, ["Standard channel best practices"])


def generate_allocation_rationale(
    channel: str,
    role: ChannelRole,
    objective: CampaignObjective
) -> str:
    """Generate rationale for channel allocation."""
    rationales = {
        (ChannelRole.PRIMARY, CampaignObjective.AWARENESS): (
            f"{channel} serves as primary awareness driver with broad reach "
            "and high impact for brand building"
        ),
        (ChannelRole.PRIMARY, CampaignObjective.TRAFFIC): (
            f"{channel} is primary traffic driver with strong intent signals "
            "and direct response capabilities"
        ),
        (ChannelRole.PRIMARY, CampaignObjective.LTO_LAUNCH): (
            f"{channel} provides launch impact and urgency messaging "
            "to drive trial during limited time window"
        ),
        (ChannelRole.SECONDARY, CampaignObjective.AWARENESS): (
            f"{channel} complements primary channels with incremental reach "
            "and reinforcement frequency"
        ),
        (ChannelRole.SUPPORT, CampaignObjective.AWARENESS): (
            f"{channel} provides supporting reach and targeting precision "
            "to fill gaps in primary channel coverage"
        )
    }

    default_rationale = (
        f"{channel} supports {objective.value} objective with "
        f"{role.value} role in the media mix"
    )

    return rationales.get((role, objective), default_rationale)


def generate_flight_schedule(
    start_date: date,
    end_date: date,
    objective: CampaignObjective,
    channel_allocations: List[ChannelAllocation]
) -> List[Dict[str, Any]]:
    """Generate campaign flight schedule."""
    campaign_length = (end_date - start_date).days
    flights = []

    if objective == CampaignObjective.LTO_LAUNCH:
        # Front-loaded flight for LTO
        launch_week = start_date + timedelta(days=7)
        sustain_end = start_date + timedelta(days=min(campaign_length - 7, 35))

        flights = [
            {
                "phase": "Pre-Launch Teaser",
                "start": (start_date - timedelta(days=7)).isoformat(),
                "end": (start_date - timedelta(days=1)).isoformat(),
                "weight": "Light",
                "channels": ["Paid Social", "Email"],
                "focus": "Build anticipation"
            },
            {
                "phase": "Launch Blast",
                "start": start_date.isoformat(),
                "end": launch_week.isoformat(),
                "weight": "Heavy (150% index)",
                "channels": [a.channel for a in channel_allocations if a.role == ChannelRole.PRIMARY],
                "focus": "Maximum awareness and trial"
            },
            {
                "phase": "Sustain",
                "start": (launch_week + timedelta(days=1)).isoformat(),
                "end": sustain_end.isoformat(),
                "weight": "Medium (100% index)",
                "channels": [a.channel for a in channel_allocations],
                "focus": "Maintain momentum"
            },
            {
                "phase": "Final Push",
                "start": (sustain_end + timedelta(days=1)).isoformat(),
                "end": end_date.isoformat(),
                "weight": "Medium-Heavy (120% index)",
                "channels": [a.channel for a in channel_allocations if a.role in [ChannelRole.PRIMARY, ChannelRole.SECONDARY]],
                "focus": "Last chance urgency"
            }
        ]

    elif objective == CampaignObjective.AWARENESS:
        # Pulsed flight for awareness
        pulse_length = min(14, campaign_length // 4)
        current_date = start_date
        pulse_num = 1

        while current_date < end_date:
            pulse_end = min(current_date + timedelta(days=pulse_length), end_date)
            is_on = pulse_num % 2 == 1

            flights.append({
                "phase": f"{'Pulse' if is_on else 'Dark'} {pulse_num}",
                "start": current_date.isoformat(),
                "end": pulse_end.isoformat(),
                "weight": "Heavy" if is_on else "Maintenance",
                "channels": (
                    [a.channel for a in channel_allocations if a.role == ChannelRole.PRIMARY]
                    if is_on else ["Paid Search", "Display"]
                ),
                "focus": "Reach building" if is_on else "Always-on presence"
            })

            current_date = pulse_end + timedelta(days=1)
            pulse_num += 1

    else:
        # Continuous flight for traffic/conversion
        flights = [
            {
                "phase": "Ramp-Up",
                "start": start_date.isoformat(),
                "end": (start_date + timedelta(days=min(7, campaign_length // 4))).isoformat(),
                "weight": "Light to Medium",
                "channels": [a.channel for a in channel_allocations],
                "focus": "Test and learn, establish baselines"
            },
            {
                "phase": "Optimize",
                "start": (start_date + timedelta(days=8)).isoformat(),
                "end": (end_date - timedelta(days=7)).isoformat(),
                "weight": "Medium to Heavy",
                "channels": [a.channel for a in channel_allocations],
                "focus": "Scale winners, optimize efficiency"
            },
            {
                "phase": "Push",
                "start": (end_date - timedelta(days=6)).isoformat(),
                "end": end_date.isoformat(),
                "weight": "Heavy",
                "channels": [a.channel for a in channel_allocations if a.role != ChannelRole.SUPPORT],
                "focus": "Final conversion push"
            }
        ]

    return flights


def generate_media_plan(
    campaign_name: str,
    objective: str,
    budget: float,
    start_date: str,
    end_date: str,
    target_audience: Dict[str, Any] = None,
    constraints: Dict[str, Any] = None
) -> ProcessingResult:
    """
    Generate comprehensive media plan.

    Args:
        campaign_name: Name of the campaign
        objective: Campaign objective
        budget: Total budget
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        target_audience: Target audience definition
        constraints: Channel constraints

    Returns:
        ProcessingResult containing MediaPlan
    """
    logger.info(f"Generating media plan for '{campaign_name}'")

    # Validate inputs
    validation = validate_plan_inputs(objective, budget, start_date, end_date, target_audience)
    if not validation.success:
        return validation

    try:
        objective_enum = CampaignObjective(objective.lower())
    except ValueError:
        objective_enum = CampaignObjective.AWARENESS

    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Calculate channel allocations
    allocations = calculate_channel_allocation(objective_enum, budget, constraints)

    # Generate flight schedule
    flights = generate_flight_schedule(start, end, objective_enum, allocations)

    # Generate KPI targets
    kpi_targets = {}
    for allocation in allocations:
        channel_benchmarks = CHANNEL_KPIS.get(allocation.channel, {})
        for key, value in channel_benchmarks.items():
            if key.startswith("target_"):
                metric_name = f"{allocation.channel}_{key.replace('target_', '')}"
                kpi_targets[metric_name] = value

    # Generate creative requirements
    creative_requirements = []
    for allocation in allocations:
        if allocation.channel == "TV":
            creative_requirements.append({
                "channel": "TV",
                "formats": [":30 spot", ":15 spot"],
                "quantity": 2,
                "specs": "HD 1920x1080, 23.98fps",
                "deadline": (start - timedelta(days=14)).isoformat()
            })
        elif allocation.channel in ["CTV/OTT", "Digital Video"]:
            creative_requirements.append({
                "channel": allocation.channel,
                "formats": [":30 video", ":15 video", ":06 bumper"],
                "quantity": 3,
                "specs": "MP4, H.264, 16:9 and 9:16",
                "deadline": (start - timedelta(days=7)).isoformat()
            })
        elif allocation.channel == "Paid Social":
            creative_requirements.append({
                "channel": "Paid Social",
                "formats": ["1:1 image", "9:16 story", "4:5 video"],
                "quantity": 5,
                "specs": "1080x1080, 1080x1920, see platform specs",
                "deadline": (start - timedelta(days=5)).isoformat()
            })
        elif allocation.channel == "Display":
            creative_requirements.append({
                "channel": "Display",
                "formats": ["300x250", "728x90", "160x600", "300x600"],
                "quantity": 4,
                "specs": "JPG/PNG/GIF, <150KB",
                "deadline": (start - timedelta(days=5)).isoformat()
            })

    # Measurement plan
    measurement_plan = {
        "primary_kpis": [],
        "secondary_kpis": [],
        "measurement_partners": [],
        "reporting_cadence": {},
        "attribution_model": "multi-touch"
    }

    if objective_enum == CampaignObjective.AWARENESS:
        measurement_plan["primary_kpis"] = ["Reach", "Frequency", "Brand Lift"]
        measurement_plan["secondary_kpis"] = ["Video Completion", "Engagement"]
        measurement_plan["measurement_partners"] = ["Nielsen", "Brand Lift Study"]
    else:
        measurement_plan["primary_kpis"] = ["Conversions", "CPA", "ROAS"]
        measurement_plan["secondary_kpis"] = ["CTR", "CVR", "Traffic"]
        measurement_plan["measurement_partners"] = ["Google Analytics", "MMM"]

    measurement_plan["reporting_cadence"] = {
        "daily": ["Spend", "Impressions", "Clicks"],
        "weekly": ["Full metrics", "Optimization actions"],
        "monthly": ["Performance review", "Budget reconciliation"],
        "post-campaign": ["Full analysis", "Learnings documentation"]
    }

    # Build media plan
    media_plan = MediaPlan(
        campaign_name=campaign_name,
        objective=objective_enum,
        total_budget=budget,
        start_date=start,
        end_date=end,
        target_audience=target_audience or {},
        channel_allocations=allocations,
        flight_schedule=flights,
        kpi_targets=kpi_targets,
        creative_requirements=creative_requirements,
        measurement_plan=measurement_plan
    )

    # Convert to serializable format
    plan_data = {
        "campaign_name": media_plan.campaign_name,
        "objective": media_plan.objective.value,
        "total_budget": media_plan.total_budget,
        "dates": {
            "start": media_plan.start_date.isoformat(),
            "end": media_plan.end_date.isoformat(),
            "duration_days": (media_plan.end_date - media_plan.start_date).days
        },
        "target_audience": media_plan.target_audience,
        "channel_allocations": [
            {
                "channel": a.channel,
                "role": a.role.value,
                "budget": a.budget,
                "budget_percentage": a.budget_percentage,
                "rationale": a.rationale,
                "kpis": a.kpis,
                "tactics": a.tactics
            }
            for a in media_plan.channel_allocations
        ],
        "flight_schedule": media_plan.flight_schedule,
        "kpi_targets": media_plan.kpi_targets,
        "creative_requirements": media_plan.creative_requirements,
        "measurement_plan": media_plan.measurement_plan
    }

    logger.info(f"Media plan generated with {len(allocations)} channels")

    return ProcessingResult(
        success=True,
        data=plan_data,
        warnings=validation.warnings,
        errors=[],
        metadata={
            "channels_recommended": len(allocations),
            "flight_phases": len(flights)
        }
    )


def format_media_plan_text(plan: Dict[str, Any]) -> str:
    """Format media plan as readable text."""
    lines = [
        "=" * 80,
        f"MEDIA PLAN: {plan['campaign_name']}",
        "=" * 80,
        "",
        "CAMPAIGN OVERVIEW",
        "-" * 40,
        f"Objective: {plan['objective'].upper()}",
        f"Total Budget: ${plan['total_budget']:,.2f}",
        f"Dates: {plan['dates']['start']} to {plan['dates']['end']} ({plan['dates']['duration_days']} days)",
        "",
        "CHANNEL ALLOCATION",
        "-" * 40,
    ]

    for channel in plan['channel_allocations']:
        lines.append(
            f"\n{channel['channel']} [{channel['role'].upper()}]"
        )
        lines.append(f"  Budget: ${channel['budget']:,.2f} ({channel['budget_percentage']}%)")
        lines.append(f"  Rationale: {channel['rationale']}")
        lines.append(f"  KPIs: {', '.join(channel['kpis'])}")
        lines.append("  Tactics:")
        for tactic in channel['tactics']:
            lines.append(f"    - {tactic}")

    lines.extend([
        "",
        "FLIGHT SCHEDULE",
        "-" * 40,
    ])

    for flight in plan['flight_schedule']:
        lines.append(
            f"\n{flight['phase']}: {flight['start']} to {flight['end']}"
        )
        lines.append(f"  Weight: {flight['weight']}")
        lines.append(f"  Focus: {flight['focus']}")
        lines.append(f"  Channels: {', '.join(flight['channels'])}")

    lines.extend([
        "",
        "CREATIVE REQUIREMENTS",
        "-" * 40,
    ])

    for creative in plan['creative_requirements']:
        lines.append(f"\n{creative['channel']}:")
        lines.append(f"  Formats: {', '.join(creative['formats'])}")
        lines.append(f"  Quantity: {creative['quantity']} versions")
        lines.append(f"  Deadline: {creative['deadline']}")

    lines.append("")
    lines.append("=" * 80)

    return "\n".join(lines)


if __name__ == "__main__":
    # Example usage
    result = generate_media_plan(
        campaign_name="Summer LTO - Pretzel Bites Launch",
        objective="lto_launch",
        budget=500000,
        start_date="2024-06-01",
        end_date="2024-07-15",
        target_audience={
            "age_range": "18-54",
            "geography": "National",
            "interests": ["QSR", "fast food", "snacking"],
            "dayparts": ["lunch", "snack", "dinner"]
        }
    )

    if result.success:
        print(format_media_plan_text(result.data))
        print("\n\nJSON Output:")
        print(json.dumps(result.data, indent=2))
    else:
        print("Plan generation failed:")
        for error in result.errors:
            print(f"  - {error}")
