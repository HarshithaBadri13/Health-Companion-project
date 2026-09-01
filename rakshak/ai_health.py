"""AI health monitoring logic for Rakshak."""


def analyze_health_metrics(heart_rate, spo2, temperature, stress_level, recovery):
    """Return a basic health status summary from sensor-like values."""
    if spo2 < 90 or heart_rate > 120 or temperature > 39:
        return "Critical"
    if spo2 < 94 or heart_rate > 100 or stress_level > 70 or recovery < 45:
        return "Warning"
    if stress_level > 50 or recovery < 60:
        return "Monitor"
    return "Normal"


def get_recommendation(status):
    recommendations = {
        "Critical": "Seek urgent medical attention and move to a safe place immediately.",
        "Warning": "Take a rest break, hydrate, and monitor your condition closely.",
        "Monitor": "Reduce exertion and keep monitoring your vital signs.",
        "Normal": "Your health metrics are stable; continue your routine.",
    }
    return recommendations.get(status, recommendations["Normal"])
