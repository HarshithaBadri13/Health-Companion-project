from rakshak.ai_health import analyze_health_metrics, get_recommendation
from rakshak.disaster import assess_disaster_risk, get_disaster_guidance
from rakshak.environment import assess_environment, get_environment_action


def main():
    """Main application entry point for the Rakshak project."""
    print("Rakshak AI Health Companion")

    health_status = analyze_health_metrics(
        heart_rate=92,
        spo2=95,
        temperature=36.8,
        stress_level=58,
        recovery=68,
    )

    environment_status = assess_environment(
        temp=34,
        humidity=76,
        aqi=65,
        flood_risk=55,
    )

    disaster_status = assess_disaster_risk(
        weather_risk=60,
        flood_risk=55,
        heat_risk=65,
    )

    print(f"Health status: {health_status}")
    print(f"Recommendation: {get_recommendation(health_status)}")
    print(f"Environment status: {environment_status}")
    print(f"Environment action: {get_environment_action(environment_status)}")
    print(f"Disaster risk: {disaster_status}")
    print(f"Disaster guidance: {get_disaster_guidance(disaster_status)}")


if __name__ == "__main__":
    main()
