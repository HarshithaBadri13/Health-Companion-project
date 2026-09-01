"""Environmental risk analysis for Rakshak."""


def assess_environment(temp, humidity, aqi, flood_risk):
    """Evaluate current environmental risk based on conditions."""
    risk_score = 0
    if temp > 35:
        risk_score += 30
    if humidity > 75:
        risk_score += 15
    if aqi > 60:
        risk_score += 25
    if flood_risk > 50:
        risk_score += 30

    if risk_score >= 70:
        return "High Risk"
    if risk_score >= 40:
        return "Moderate Risk"
    return "Low Risk"


def get_environment_action(level):
    actions = {
        "High Risk": "Move to a safer indoor location, hydrate, and avoid outdoor exposure.",
        "Moderate Risk": "Keep monitoring conditions and prepare emergency supplies.",
        "Low Risk": "Routine conditions are stable; continue regular monitoring.",
    }
    return actions.get(level, actions["Low Risk"])
