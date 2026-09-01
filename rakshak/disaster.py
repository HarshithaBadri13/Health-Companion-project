"""Disaster and safety monitoring logic for Rakshak."""


def assess_disaster_risk(weather_risk, flood_risk, heat_risk):
    """Combine disaster inputs into a unified disaster risk rating."""
    score = weather_risk + flood_risk + heat_risk
    if score >= 180:
        return "Critical"
    if score >= 120:
        return "High"
    if score >= 70:
        return "Warning"
    return "Normal"


def get_disaster_guidance(level):
    guidance = {
        "Critical": "Evacuate if advised by local authorities and contact emergency services immediately.",
        "High": "Move to higher ground or safer shelter and keep emergency contacts ready.",
        "Warning": "Stay alert, avoid risk zones, and monitor weather updates closely.",
        "Normal": "Routine conditions are stable; continue standard safety checks.",
    }
    return guidance.get(level, guidance["Normal"])
