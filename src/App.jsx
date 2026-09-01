import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Gauge,
  HeartPulse,
  Lock,
  MoonStar,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  TrendingUp,
  Zap,
} from "lucide-react";

const T = {
  bg: "#071b2a",
  surface: "#0d2231",
  panel: "#102d3b",
  panelAlt: "#142f3f",
  border: "#1d3f52",
  borderSoft: "#183548",
  text: "#eaf7f8",
  textDim: "#9bb6bf",
  textMuted: "#698796",
  accent: "#4ee2c7",
  accent2: "#8b7cf6",
  warm: "#ffbf69",
  good: "#60e39a",
  danger: "#ff6b6b",
  shadow: "rgba(10, 20, 26, 0.45)",
};

const history = [
  { day: "Mon", sleep: 6.8, recovery: 72, focus: 68, stress: 52, mood: 71 },
  { day: "Tue", sleep: 7.4, recovery: 76, focus: 73, stress: 44, mood: 74 },
  { day: "Wed", sleep: 6.9, recovery: 70, focus: 66, stress: 59, mood: 68 },
  { day: "Thu", sleep: 7.9, recovery: 84, focus: 81, stress: 36, mood: 83 },
  { day: "Fri", sleep: 7.2, recovery: 78, focus: 76, stress: 41, mood: 79 },
  { day: "Sat", sleep: 8.3, recovery: 86, focus: 88, stress: 28, mood: 88 },
  { day: "Sun", sleep: 7.6, recovery: 80, focus: 83, stress: 33, mood: 84 },
];

const average = (key) => history.reduce((sum, item) => sum + item[key], 0) / history.length;

const getLocationWeatherProfile = (city = "", state = "", latitude = null, longitude = null) => {
  const key = `${city} ${state}`.toLowerCase();

  if (/(delhi|new delhi|gurugram|noida|faridabad|jaipur|ahmedabad|lucknow|kanpur|agra|gwalior|patna|nagpur|bhopal|jaipur)/i.test(key)) {
    return {
      temp: 36,
      humidity: 72,
      airQuality: 72,
      floodRisk: 24,
      extremeHeat: 80,
      pollution: 62,
      uvIndex: 9,
      windSpeed: 26,
      rainfall: 28,
      regionLabel: "North / Central heat zone",
      riskBias: "heat",
    };
  }

  if (/(mumbai|kolkata|chennai|visakhapatnam|guwahati|kochi|goa|coastal|pune|hyd|hyderabad|bengaluru|bangalore)/i.test(key)) {
    return {
      temp: 33,
      humidity: 80,
      airQuality: 58,
      floodRisk: 66,
      extremeHeat: 58,
      pollution: 45,
      uvIndex: 8,
      windSpeed: 34,
      rainfall: 72,
      regionLabel: "Coastal / monsoon zone",
      riskBias: "flood",
    };
  }

  if (/(shimla|manali|mussoorie|nainital|darjeeling|leh|srinagar|kashmir|hill|mountain)/i.test(key)) {
    return {
      temp: 24,
      humidity: 60,
      airQuality: 42,
      floodRisk: 32,
      extremeHeat: 28,
      pollution: 30,
      uvIndex: 6,
      windSpeed: 22,
      rainfall: 40,
      regionLabel: "Hilly / cooler region",
      riskBias: "stable",
    };
  }

  if (latitude != null && longitude != null) {
    if (latitude > 20 && latitude < 30 && longitude > 68 && longitude < 80) {
      return {
        temp: 35,
        humidity: 70,
        airQuality: 68,
        floodRisk: 22,
        extremeHeat: 78,
        pollution: 58,
        uvIndex: 9,
        windSpeed: 28,
        rainfall: 32,
        regionLabel: "Detected inland heat zone",
        riskBias: "heat",
      };
    }

    if (longitude > 72 && latitude < 20) {
      return {
        temp: 32,
        humidity: 84,
        airQuality: 55,
        floodRisk: 72,
        extremeHeat: 54,
        pollution: 40,
        uvIndex: 7,
        windSpeed: 36,
        rainfall: 78,
        regionLabel: "Detected coastal / monsoon zone",
        riskBias: "flood",
      };
    }
  }

  return {
    temp: 31,
    humidity: 68,
    airQuality: 42,
    floodRisk: 18,
    extremeHeat: 62,
    pollution: 34,
    uvIndex: 7,
    windSpeed: 28,
    rainfall: 42,
    regionLabel: "Mixed urban zone",
    riskBias: "balanced",
  };
};

const normalizePhoneNumber = (value = "") => String(value).replace(/\D/g, "");

const sanitizeEmergencyContact = (contact = {}) => {
  const name = String(contact.name || "Emergency contact").trim();
  const phone = normalizePhoneNumber(contact.phone || "");

  return {
    name: name || "Emergency contact",
    phone,
  };
};

const getRecentCallHistoryApi = () => {
  const candidates = [
    navigator.callHistory,
    navigator.getCallHistory,
    navigator.callLog,
    navigator.telephony?.getCallLog,
    navigator.telephony?.getCalls,
  ];

  return candidates.find(Boolean);
};

const recentCallPermissionMessage =
  "Rakshak needs access to your recent calls to identify your most recently contacted people for emergency assistance.";

function scoreFromMetrics(metric) {
  if (metric >= 85) return "excellent";
  if (metric >= 70) return "stable";
  if (metric >= 55) return "watch";
  return "low";
}

function getTrendLabel(value, baseline) {
  const delta = value - baseline;
  if (delta > 0) return `+${delta.toFixed(1)}`;
  if (delta < 0) return `${delta.toFixed(1)}`;
  return "0.0";
}

const defaultProfile = {
  fullName: "",
  email: "",
  password: "",
  age: "",
  gender: "Female",
  goal: "Improve daily energy",
  activity: "Moderate",
  focus: "Stress and sleep",
  sleepTarget: "8 hours",
  phone: "",
  emergencyContact: "",
  notes: "",
  agree: false,
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [profile, setProfile] = useState(defaultProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState(null);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  const launchToScreen = (nextScreen, label) => {
    setLoadingTarget(label);
    window.setTimeout(() => {
      setScreen(nextScreen);
      setLoadingTarget(null);
    }, 900);
  };

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const goToDashboard = () => {
    setIsAuthenticated(true);
    launchToScreen("dashboard", "Launching your dashboard");
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();

    if (!profile.email || !profile.password) {
      return;
    }

    if (authMode === "signup" && (!profile.fullName || !profile.age || !profile.agree)) {
      return;
    }

    goToDashboard();
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loadingTarget) {
    return <LoadingScreen message={loadingTarget} />;
  }

  if (screen === "landing") {
    return (
      <LandingPage
        onStart={() => launchToScreen("auth", "Opening your secure setup")}
        onLogin={() => {
          setAuthMode("login");
          launchToScreen("auth", "Signing you in");
        }}
      />
    );
  }

  if (screen === "auth") {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        profile={profile}
        updateProfile={updateProfile}
        onSubmit={handleAuthSubmit}
        onBack={() => setScreen("landing")}
      />
    );
  }

  return <Dashboard profile={profile} onLogout={() => { setIsAuthenticated(false); setScreen("landing"); }} />;
}

function SplashScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "radial-gradient(circle at top, rgba(78,226,199,0.18), transparent 30%), #071b2a", color: T.text, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        .splash-shell {
          display: flex; flex-direction: column; align-items: center; gap: 18px; position: relative; z-index: 1;
        }
        .splash-orb {
          position: absolute; inset: auto; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(78,226,199,0.18), rgba(78,226,199,0.04) 35%, transparent 70%);
          filter: blur(10px); animation: floatOrb 8s ease-in-out infinite;
        }
        .splash-orb.alt { background: radial-gradient(circle, rgba(139,124,246,0.16), rgba(139,124,246,0.04) 35%, transparent 70%); transform: scale(1.3); animation-delay: 1s; }
        .splash-logo {
          width: 118px; height: 118px; border-radius: 30px; border: 1px solid rgba(78,226,199,0.5);
          background: linear-gradient(135deg, rgba(78,226,199,0.2), rgba(139,124,246,0.18), rgba(255,255,255,0.06));
          box-shadow: 0 0 42px rgba(78,226,199,0.18), inset 0 0 24px rgba(255,255,255,0.04);
          display: grid; place-items: center; position: relative; animation: splashPulse 1.8s ease-in-out infinite;
        }
        .splash-logo::before {
          content: ""; position: absolute; inset: -16px; border-radius: 38px; border: 1px solid rgba(78,226,199,0.25); animation: ringPulse 1.8s ease-out infinite;
        }
        @keyframes splashPulse { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.08) rotate(2deg); } }
        @keyframes ringPulse { 0% { opacity: 0.8; transform: scale(0.92); } 100% { opacity: 0; transform: scale(1.12); } }
        @keyframes floatOrb { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-18px) scale(1.08); } }
        .splash-wordmark { font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 800; letter-spacing: -0.08em; }
        .splash-tag { color: ${T.textDim}; letter-spacing: 0.18em; font-size: 11px; text-transform: uppercase; }
        .splash-loader {
          width: 190px; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; position: relative;
        }
        .splash-loader::before {
          content: ""; position: absolute; inset: 0; width: 38%; border-radius: inherit; background: linear-gradient(90deg, ${T.accent}, #8ae4d0, ${T.accent2}); animation: loadingSlide 1.3s ease-in-out infinite;
        }
        @keyframes loadingSlide { 0% { transform: translateX(-120%); } 100% { transform: translateX(280%); } }
      `}</style>
      <div className="splash-orb" />
      <div className="splash-orb alt" />
      <div className="splash-shell">
        <div className="splash-logo">
          <ShieldCheck size={48} color={T.accent} />
        </div>
        <div className="splash-wordmark">Rakshak</div>
        <div className="splash-tag">Health Companion</div>
        <div className="splash-loader" />
      </div>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: T.bg, color: T.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        .loader-shell {
          display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; padding: 28px;
          background: rgba(13,34,49,0.9); border: 1px solid ${T.border}; border-radius: 28px; box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        }
        .loader-ring {
          width: 78px; height: 78px; border-radius: 50%; border: 2px solid rgba(78,226,199,0.18); border-top-color: ${T.accent}; border-right-color: ${T.accent2}; animation: spinLoader 1s linear infinite;
          position: relative;
        }
        .loader-ring::after {
          content: ""; position: absolute; inset: 12px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.12);
        }
        @keyframes spinLoader { to { transform: rotate(360deg); } }
        .loader-text { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.textMuted}; }
        .loader-title { font-size: clamp(1.6rem, 4vw, 2.5rem); letter-spacing: -0.06em; font-weight: 700; }
      `}</style>
      <div className="loader-shell">
        <div className="loader-ring" />
        <div className="loader-text">Initializing</div>
        <div className="loader-title">{message}</div>
      </div>
    </div>
  );
}

function LandingPage({ onStart, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; }
        a { color: inherit; text-decoration: none; }
        .landing-shell { max-width: 1220px; margin: 0 auto; padding: 32px 22px 56px; }
        @keyframes floatOrb { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-12px) translateX(8px); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark { width: 38px; height: 38px; border-radius: 12px; background: rgba(78, 226, 199, 0.14); border: 1px solid rgba(78, 226, 199, 0.4); display: flex; align-items: center; justify-content: center; }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .ghost-btn, .primary-btn { border-radius: 12px; padding: 12px 18px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
        .ghost-btn { background: transparent; border-color: ${T.border}; color: ${T.text}; }
        .primary-btn { background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; }
        .hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: center; }
        .hero-panel {
          padding: 34px; border-radius: 28px; border: 1px solid ${T.border};
          background: linear-gradient(180deg, rgba(17,42,54,0.98), rgba(9,25,35,0.98));
          box-shadow: 0 22px 60px rgba(0,0,0,0.30); position: relative; overflow: hidden;
        }
        .hero-panel .floating-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px;
          background: rgba(78,226,199,0.12); border: 1px solid rgba(78,226,199,0.28); color: ${T.accent};
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
        }
        .hero-panel::before { content: ""; position: absolute; inset: -30% 30% auto auto; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(78,226,199,0.22), transparent 68%); animation: glowPulse 7s ease-in-out infinite; }
        .hero-panel::after { content: ""; position: absolute; left: -80px; bottom: -70px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(139,124,246,0.2), transparent 70%); animation: floatOrb 9s ease-in-out infinite; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; color: #d6ccff; letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 12px; border-radius: 999px; background: rgba(139,124,246,0.08); border: 1px solid rgba(139,124,246,0.25); }
        h1 { margin: 18px 0 16px; font-size: clamp(2.8rem, 6vw, 5rem); line-height: 0.96; letter-spacing: -0.08em; }
        .gradient-text { background: linear-gradient(135deg, #effcf6 0%, #61dcc5 35%, #b7d0ff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .landing-copy { max-width: 620px; color: ${T.textDim}; font-size: 17px; line-height: 1.7; }
        .cta-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
        .mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 26px; }
        .mini-stat { padding: 14px 16px; border: 1px solid ${T.border}; background: rgba(255,255,255,0.02); border-radius: 16px; }
        .mini-stat .num { font-size: 26px; font-weight: 700; letter-spacing: -0.06em; }
        .mini-stat .label { color: ${T.textDim}; font-size: 12px; }
        .feature-panel { padding: 24px; border-radius: 28px; border: 1px solid ${T.border}; background: rgba(15,36,49,0.9); }
        .feature-card { padding: 18px; border-radius: 18px; border: 1px solid ${T.borderSoft}; background: ${T.panelAlt}; margin-bottom: 14px; }
        .feature-card:last-child { margin-bottom: 0; }
        .feature-card h3 { font-size: 18px; margin: 12px 0 8px; }
        .feature-card p { margin: 0; color: ${T.textDim}; line-height: 1.6; font-size: 14px; }
        .feature-row { display: flex; align-items: center; gap: 10px; }
        .visual-card { padding: 18px; border-radius: 24px; border: 1px solid ${T.border}; background: linear-gradient(180deg, rgba(11,27,37,0.9), rgba(15,35,48,0.9)); box-shadow: 0 24px 50px rgba(0,0,0,0.25); }
        .visual-top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 18px; }
        .visual-pill { display:inline-flex; align-items:center; gap:8px; padding: 7px 10px; border-radius: 999px; background: rgba(78,226,199,0.09); border: 1px solid rgba(78,226,199,0.25); color: ${T.accent}; font-size: 12px; }
        .mini-visual-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .mini-panel { background: rgba(255,255,255,0.02); border: 1px solid ${T.borderSoft}; border-radius: 16px; padding: 12px; }
        .mini-panel h4 { margin: 0 0 10px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.textMuted}; }
        .mini-panel .big { font-size: 28px; font-weight: 700; letter-spacing: -0.06em; }
        .mini-panel .sub { color: ${T.textDim}; font-size: 12px; margin-top: 6px; }
        .visual-chart { height: 110px; margin-top: 14px; border-radius: 14px; background: linear-gradient(180deg, rgba(78,226,199,0.12), rgba(139,124,246,0.06)); border: 1px solid ${T.borderSoft}; position: relative; overflow: hidden; }
        .visual-chart::before { content: ""; position:absolute; inset: 12% 8% 16% 8%; background: linear-gradient(180deg, rgba(78,226,199,0), rgba(78,226,199,0.5)); clip-path: polygon(0% 100%, 16% 64%, 30% 70%, 44% 50%, 56% 58%, 74% 26%, 100% 18%, 100% 100%); }
        .visual-chart::after { content: ""; position:absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, transparent 40%, rgba(255,255,255,0.06) 60%, transparent 80%); }
        .benefits { margin-top: 28px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .benefit { padding: 24px 18px; border-radius: 20px; border: 1px solid ${T.border}; background: rgba(13,34,49,0.8); }
        .benefit h4 { margin: 12px 0 8px; font-size: 20px; }
        .benefit p { margin: 0; color: ${T.textDim}; font-size: 14px; line-height: 1.6; }
        .journey { margin-top: 30px; padding: 28px 24px; border-radius: 24px; border: 1px solid ${T.border}; background: linear-gradient(180deg, rgba(13,34,49,0.8), rgba(9,25,35,0.92)); }
        .journey-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 18px; }
        .journey-header h3 { margin:0; font-size: clamp(1.5rem, 2vw, 2.1rem); letter-spacing:-0.05em; }
        .journey-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px; }
        .journey-card { padding: 18px; border-radius: 18px; border: 1px solid ${T.borderSoft}; background: rgba(255,255,255,0.02); }
        .journey-card .step { display:inline-flex; align-items:center; justify-content:center; width: 34px; height:34px; border-radius:12px; background: rgba(78,226,199,0.12); border: 1px solid rgba(78,226,199,0.35); color: ${T.accent}; font-weight: 700; }
        .journey-card h4 { margin: 12px 0 8px; font-size: 20px; }
        .journey-card p { margin:0; color: ${T.textDim}; line-height:1.6; font-size:14px; }
        @media (max-width: 900px) {
          .hero, .benefits, .mini-stats, .journey-grid { grid-template-columns: 1fr; }
          .nav { flex-wrap: wrap; }
        }
      `}</style>

      <div className="landing-shell">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark"><ShieldCheck size={18} color={T.accent} /></div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em" }}>Rakshak</div>
          </div>
          <div className="nav-actions">
            <button className="ghost-btn" onClick={onLogin}>Login</button>
            <button className="primary-btn" onClick={onStart}>Let’s Start</button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-panel">
            <div className="floating-badge"><Sparkles size={12} /> Privacy-first health intelligence</div>
            <h1>Stay protected. <span className="gradient-text">Act earlier.</span></h1>
            <div className="landing-copy">
              Personal Health Companion uses on-device AI to continuously monitor physiological and environmental signals, detect anomalies in real time, and issue early warnings for extreme weather, health risks, and dangerous changes in your condition — all without sending your data to the cloud.
            </div>
            <div className="cta-group">
              <button className="primary-btn" onClick={onStart}>Let’s Start <ArrowRight size={16} /></button>
              <button className="ghost-btn" onClick={onLogin}>Already have an account</button>
            </div>
            <div className="mini-stats">
              <div className="mini-stat"><div className="num">24/7</div><div className="label">offline protection</div></div>
              <div className="mini-stat"><div className="num">AI</div><div className="label">on-device analysis</div></div>
              <div className="mini-stat"><div className="num">SOS</div><div className="label">disaster alerts</div></div>
            </div>
          </div>

          <div className="visual-card">
            <div className="visual-top">
              <div className="visual-pill"><ShieldCheck size={12} color={T.accent} /> Live risk scan</div>
              <div style={{ color: T.textDim, fontSize: 12 }}>14:20</div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
              alt="Health monitoring"
              style={{
                width: "100%",
                height: 260,
                objectFit: "cover",
                borderRadius: 18,
                border: `1px solid ${T.borderSoft}`,
                display: "block",
                marginBottom: 14,
              }}
            />

            <div className="mini-visual-grid">
              <div className="mini-panel">
                <h4>Health</h4>
                <div className="big" style={{ color: T.accent }}>86</div>
                <div className="sub">Stable recovery</div>
              </div>
              <div className="mini-panel">
                <h4>Environment</h4>
                <div className="big" style={{ color: T.warm }}>68</div>
                <div className="sub">Heat caution</div>
              </div>
            </div>

            <div className="visual-chart" aria-label="Health trend chart" />

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div className="mini-panel" style={{ flex: 1 }}>
                <h4>Air</h4>
                <div className="big" style={{ fontSize: 20, color: T.accent2 }}>42 AQI</div>
              </div>
              <div className="mini-panel" style={{ flex: 1 }}>
                <h4>UV</h4>
                <div className="big" style={{ fontSize: 20, color: T.warm }}>7/10</div>
              </div>
            </div>
          </div>
        </section>

        <section className="journey">
          <div className="journey-header">
            <h3>How it works</h3>
            <div className="panel-copy" style={{ color: T.textDim }}>On-device, resilient, life-aware</div>
          </div>
          <div className="journey-grid">
            <div className="journey-card">
              <div className="step">1</div>
              <h4>Capture key signals</h4>
              <p>Monitor physiology and environment directly from wearables and mobile sensors without exposing data externally.</p>
            </div>
            <div className="journey-card">
              <div className="step">2</div>
              <h4>Detect risk in real time</h4>
              <p>Run local AI analysis to identify early warnings for heat stress, illness, anxiety spikes, and dangerous conditions.</p>
            </div>
            <div className="journey-card">
              <div className="step">3</div>
              <h4>Respond fast</h4>
              <p>Get actionable alerts and emergency guidance during extreme weather events or health emergencies, even offline.</p>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div className="benefit">
            <ShieldCheck size={22} color={T.accent} />
            <h4>Private</h4>
            <p>All decision-making happens on-device so personal health data remains private, secure, and under user control.</p>
          </div>
          <div className="benefit">
            <TrendingUp size={22} color={T.accent2} />
            <h4>Actionable</h4>
            <p>Real-time anomaly detection turns small changes into precise warnings and health actions before the risks grow.</p>
          </div>
          <div className="benefit">
            <Target size={22} color={T.warm} />
            <h4>Disaster aware</h4>
            <p>Built to support emergency readiness during extreme weather and crisis conditions with clear guidance and fast alerts.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthPage({ authMode, setAuthMode, profile, updateProfile, onSubmit, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "Inter, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .auth-box { width: min(980px, 100%); background: linear-gradient(180deg, rgba(16,45,59,0.98), rgba(10,28,38,0.95)); border: 1px solid ${T.border}; border-radius: 28px; box-shadow: 0 28px 60px rgba(0,0,0,0.3); overflow: hidden; }
        .auth-top { padding: 20px 28px; border-bottom: 1px solid ${T.border}; display:flex; justify-content:space-between; align-items:center; }
        .switch { display:flex; gap: 8px; background: ${T.surface}; padding: 6px; border-radius: 12px; border: 1px solid ${T.border}; }
        .toggle { border: none; background: transparent; color: ${T.textDim}; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .toggle.active { background: rgba(78,226,199,0.12); color: ${T.text}; border: 1px solid rgba(78,226,199,0.35); }
        .auth-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; }
        .info-panel { padding: 28px; background: linear-gradient(180deg, rgba(78,226,199,0.08), rgba(139,124,246,0.04)); border-right: 1px solid ${T.border}; }
        .info-panel h2 { margin: 18px 0 12px; font-size: 34px; letter-spacing: -0.05em; }
        .info-panel p { margin: 0; line-height: 1.7; color: ${T.textDim}; }
        .info-list { margin-top: 22px; display:grid; gap: 12px; }
        .list-item { display:flex; align-items:flex-start; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid ${T.border}; border-radius: 14px; color: ${T.textDim}; }
        .form-panel { padding: 28px; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        label { display: flex; flex-direction: column; gap: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: ${T.textMuted}; }
        input, select, textarea { width: 100%; border-radius: 12px; border: 1px solid ${T.border}; background: rgba(6,18,26,0.8); color: ${T.text}; padding: 12px 14px; font-size: 14px; }
        input::placeholder, textarea::placeholder { color: ${T.textMuted}; }
        .span-2 { grid-column: span 2; }
        .checkbox-row { display:flex; align-items:flex-start; gap: 10px; color: ${T.textDim}; font-size: 13px; margin-top: 8px; }
        .checkbox-row input { width: 18px; height: 18px; accent-color: ${T.accent}; }
        .submit-btn { margin-top: 18px; width: 100%; padding: 14px 18px; border: none; border-radius: 12px; background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; font-weight: 800; cursor: pointer; }
        @media (max-width: 760px) {
          .auth-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .auth-box { border-radius: 20px; }
          .auth-top { padding: 18px 18px; }
          .info-panel, .form-panel { padding: 20px; }
          .switch { width: 100%; }
          .toggle { flex: 1; }
        }
      `}</style>

      <div className="auth-box">
        <div className="auth-top">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(78,226,199,0.12)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} color={T.accent} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Rakshak</div>
          </div>
          <div className="switch">
            <button className={`toggle ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
            <button className={`toggle ${authMode === "signup" ? "active" : ""}`} onClick={() => setAuthMode("signup")}>Create account</button>
          </div>
        </div>

        <div className="auth-grid">
          <div className="info-panel">
            <div className="eyebrow" style={{ display: "inline-flex" }}><Sparkles size={12} /> Your wellness profile</div>
            <h2>{authMode === "login" ? "Welcome back" : "Start your baseline"}</h2>
            <p>
              {authMode === "login"
                ? "Securely sign in to revisit your health baseline, risk alerts, and personalized safety guidance while keeping your data protected on-device."
                : "Create your profile so the companion can personalize offline monitoring, anomaly detection, and emergency readiness around your health and environment."}
            </p>

            <div className="info-list">
              <div className="list-item"><CheckCircle2 size={16} color={T.accent} /> <span>Weekly health trends and scores</span></div>
              <div className="list-item"><Clock3 size={16} color={T.accent2} /> <span>Personalized recovery and routine guidance</span></div>
              <div className="list-item"><Lock size={16} color={T.warm} /> <span>Private, secure, and goal-focused</span></div>
            </div>
          </div>

          <div className="form-panel">
            <form onSubmit={onSubmit}>
              <div className="form-grid">
                {authMode === "signup" && (
                  <>
                    <label className="span-2">
                      Full name
                      <input value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)} placeholder="Enter your full name" />
                    </label>
                    <label>
                      Age
                      <input value={profile.age} onChange={(e) => updateProfile("age", e.target.value)} placeholder="Age" />
                    </label>
                    <label>
                      Gender
                      <select value={profile.gender} onChange={(e) => updateProfile("gender", e.target.value)}>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </label>
                  </>
                )}

                <label className={authMode === "signup" ? "span-2" : ""}>
                  Email address
                  <input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} placeholder="you@example.com" />
                </label>

                <label className={authMode === "signup" ? "span-2" : ""}>
                  Password
                  <input type="password" value={profile.password} onChange={(e) => updateProfile("password", e.target.value)} placeholder="Enter password" />
                </label>

                {authMode === "signup" && (
                  <>
                    <label>
                      Wellness goal
                      <select value={profile.goal} onChange={(e) => updateProfile("goal", e.target.value)}>
                        <option>Improve daily energy</option>
                        <option>Sleep better</option>
                        <option>Reduce stress</option>
                        <option>Boost focus</option>
                        <option>Improve consistency</option>
                      </select>
                    </label>
                    <label>
                      Activity level
                      <select value={profile.activity} onChange={(e) => updateProfile("activity", e.target.value)}>
                        <option>Low</option>
                        <option>Moderate</option>
                        <option>High</option>
                      </select>
                    </label>
                    <label>
                      Focus area
                      <select value={profile.focus} onChange={(e) => updateProfile("focus", e.target.value)}>
                        <option>Stress and sleep</option>
                        <option>Mood and recovery</option>
                        <option>Energy and productivity</option>
                      </select>
                    </label>
                    <label>
                      Sleep target
                      <select value={profile.sleepTarget} onChange={(e) => updateProfile("sleepTarget", e.target.value)}>
                        <option>7 hours</option>
                        <option>8 hours</option>
                        <option>9 hours</option>
                      </select>
                    </label>
                    <label>
                      Phone number
                      <input value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} placeholder="+1 234 567 890" />
                    </label>
                    <label>
                      Emergency contact
                      <input value={profile.emergencyContact} onChange={(e) => updateProfile("emergencyContact", e.target.value)} placeholder="Name and phone" />
                    </label>
                    <label className="span-2">
                      Personal notes
                      <textarea rows={4} value={profile.notes} onChange={(e) => updateProfile("notes", e.target.value)} placeholder="Add any health goals, routines, or notes you want the AI to consider." />
                    </label>
                  </>
                )}
              </div>

              {authMode === "signup" && (
                <div className="checkbox-row">
                  <input type="checkbox" checked={profile.agree} onChange={(e) => updateProfile("agree", e.target.checked)} />
                  <span>I agree to keep my wellness data private and allow AI suggestions to personalize my health plan.</span>
                </div>
              )}

              <button type="submit" className="submit-btn">
                {authMode === "login" ? "Login to dashboard" : "Create account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ profile, onLogout }) {
  const [selectedDay, setSelectedDay] = useState(history.length - 1);
  const [statusText, setStatusText] = useState("Status live");
  const [activeTab, setActiveTab] = useState("ai");
  const [deviceLocation, setDeviceLocation] = useState({
    lat: null,
    lng: null,
    label: "Checking device location...",
    permission: "prompt",
    error: "",
  });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [phoneConnectMode, setPhoneConnectMode] = useState("choose");
  const [recentCallCandidates, setRecentCallCandidates] = useState([]);
  const [manualContactName, setManualContactName] = useState("");
  const [manualContactPhone, setManualContactPhone] = useState("");
  const [manualLocationCity, setManualLocationCity] = useState("");
  const [manualLocationState, setManualLocationState] = useState("");
  const [deviceAccess, setDeviceAccess] = useState({
    contacts: false,
    gps: false,
    wearables: false,
  });

  const pairingCode = "RAK-4821";

  const current = history[selectedDay];
  const liveLocation = deviceLocation.lat !== null && deviceLocation.lng !== null
    ? {
        label: "Current device location",
        lat: deviceLocation.lat,
        lng: deviceLocation.lng,
        googleMapsUrl: `https://www.google.com/maps?q=${deviceLocation.lat},${deviceLocation.lng}&z=15`,
      }
    : {
        label: "Live location unavailable",
        lat: null,
        lng: null,
        googleMapsUrl: "https://www.google.com/maps",
      };

  const environment = useMemo(() => {
    const locationProfile = getLocationWeatherProfile(
      manualLocationCity,
      manualLocationState,
      deviceLocation.lat,
      deviceLocation.lng
    );

    const gpsBoost = deviceLocation.permission === "granted" ? 3 : 0;
    const heatBias = locationProfile.riskBias === "heat" ? 9 : locationProfile.riskBias === "flood" ? 0 : -4;
    const floodBias = locationProfile.riskBias === "flood" ? 18 : locationProfile.riskBias === "heat" ? 4 : 0;
    const heatTemp = Math.min(48, Math.max(18, locationProfile.temp + heatBias + gpsBoost));
    const airValue = Math.min(100, Math.max(15, locationProfile.airQuality + (locationProfile.riskBias === "heat" ? 8 : 0) + gpsBoost));
    const humidityValue = Math.min(95, Math.max(30, locationProfile.humidity + (locationProfile.riskBias === "flood" ? 8 : 0) + gpsBoost));
    const floodValue = Math.min(100, Math.max(0, locationProfile.floodRisk + floodBias + (locationProfile.riskBias === "flood" ? 8 : 0))); 
    const extremeValue = Math.min(100, Math.max(0, locationProfile.extremeHeat + (locationProfile.riskBias === "heat" ? 12 : 0) + gpsBoost));
    const uvValue = Math.min(12, Math.max(2, locationProfile.uvIndex + (locationProfile.riskBias === "heat" ? 2 : 0) + gpsBoost));
    const windValue = Math.min(80, Math.max(10, locationProfile.windSpeed + (locationProfile.riskBias === "flood" ? 12 : 0)));
    const rainfallValue = Math.min(140, Math.max(10, locationProfile.rainfall + (locationProfile.riskBias === "flood" ? 24 : 0)));

    return {
      temp: Math.round(heatTemp),
      humidity: Math.round(humidityValue),
      airQuality: Math.round(airValue),
      uvIndex: Math.round(uvValue),
      pollen: 58,
      pollution: Math.max(20, Math.round(locationProfile.pollution + (locationProfile.riskBias === "heat" ? 8 : 0) + gpsBoost)),
      floodRisk: Math.round(floodValue),
      extremeHeat: Math.round(extremeValue),
      windSpeed: Math.round(windValue),
      rainfall: Math.round(rainfallValue),
      floodAlert: floodValue > 60 ? "High flood risk" : floodValue > 35 ? "Moderate flood risk" : "Low flood risk",
      otherRisks: locationProfile.riskBias === "flood" ? ["Heavy rain watch", "Localized flooding risk"] : locationProfile.riskBias === "heat" ? ["Heat stress watch", "Dust haze advisory"] : ["Stable weather watch", "Moderate air caution"],
      regionLabel: locationProfile.regionLabel,
    };
  }, [manualLocationCity, manualLocationState, deviceLocation.lat, deviceLocation.lng, deviceLocation.permission]);

  const isDangerState = current.stress > 45 || environment.temp > 30 || environment.airQuality > 45;
  const environmentRiskScore = Math.min(
    100,
    Math.round(
      environment.airQuality * 0.4 +
      Math.max(0, environment.temp - 24) * 4 +
      Math.max(0, environment.humidity - 55) * 0.7 +
      environment.pollution * 0.4 +
      environment.extremeHeat * 0.55 +
      environment.floodRisk * 0.6
    )
  );
  const environmentRiskLevel =
    environmentRiskScore >= 80 ? "Extreme" : environmentRiskScore >= 60 ? "High" : environmentRiskScore >= 40 ? "Moderate" : "Low";
  const environmentRecommendedAction =
    environmentRiskScore >= 80
      ? "Avoid outdoor exposure immediately. Move to safer indoor shelter, hydrate continuously, and prepare emergency contacts and evacuation support."
      : environmentRiskScore >= 60
        ? "Reduce strenuous outdoor work, keep cooling resources available, and remain alert for heat stress or worsening air conditions."
        : environmentRiskScore >= 40
          ? "Continue monitoring conditions and protect vulnerable groups. Keep hydration and backup shelter plans ready."
          : "Conditions are manageable. Maintain routine hydration and keep an eye on changing heat, air, and flood signals.";

  const applyEmergencyContacts = (contacts) => {
    const mappedContacts = contacts
      .map(sanitizeEmergencyContact)
      .filter((contact) => contact.phone.length >= 7)
      .slice(0, 5);

    setEmergencyContacts(mappedContacts);
    setStatusText(
      mappedContacts.length
        ? "Emergency contacts are ready for SOS actions."
        : "No valid emergency contacts were selected."
    );
    return mappedContacts;
  };

  const getDeviceContactPermissionNote = () => {
    const userAgent = navigator.userAgent || "";

    if (/android/i.test(userAgent)) {
      return "Android: Settings → Apps → Browser/Chrome → Permissions → Contacts → Allow";
    }

    if (/iphone|ipad|ipod/i.test(userAgent)) {
      return "iPhone: Settings → Safari/Browser → Permissions → Contacts → Allow";
    }

    return "Check your browser permissions or device settings and enable contacts access.";
  };

  const requestContactPicker = async () => {
    const isSecureContext = window.isSecureContext || location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    const contactPickerSupported = "contacts" in navigator && typeof navigator.contacts?.select === "function";

    if (!contactPickerSupported) {
      setStatusText(
        "This browser does not support direct device contact access. Use recent call history or add a contact manually instead."
      );
      setPhoneConnectMode("choose");
      setShowContactPicker(true);
      return;
    }

    if (!isSecureContext) {
      setStatusText(
        "This page must be served from HTTPS or localhost before the device contact picker can open. Use recent calls or add contacts manually for now."
      );
      setPhoneConnectMode("choose");
      setShowContactPicker(true);
      return;
    }

    try {
      setStatusText("Opening your device contact picker...");
      const selected = await navigator.contacts.select(["name", "tel"], { multiple: true });
      const contacts = (selected || [])
        .map((contact) => {
          const primaryPhone = contact.tel?.[0]?.value || contact.phone?.[0]?.value || "";
          return {
            name: contact.name?.[0] || contact.name || "Emergency contact",
            phone: primaryPhone,
          };
        })
        .map(sanitizeEmergencyContact)
        .filter((contact) => contact.phone.length >= 7)
        .slice(0, 5);

      if (!contacts.length) {
        setStatusText("No contacts were returned from the device. You can add a manual backup contact instead.");
        setPhoneConnectMode("manual");
        setShowContactPicker(true);
        return;
      }

      applyEmergencyContacts(contacts);
      setDeviceAccess((prev) => ({ ...prev, contacts: true }));
      setShowContactPicker(false);
      setStatusText("Device contacts access granted. Trusted emergency contacts are ready for SOS.");
    } catch (error) {
      console.warn("Contact Picker API denied or unavailable:", error);
      setStatusText(
        `Permission to access your contacts was denied or is unavailable. ${getDeviceContactPermissionNote()} Use recent calls or add emergency contacts manually.`
      );
      setPhoneConnectMode("choose");
      setShowContactPicker(true);
    }
  };

  const requestDeviceContactsPermission = async () => {
    await requestContactPicker();
  };

  const requestRecentCallHistoryAccess = async () => {
    const api = getRecentCallHistoryApi();

    if (!api) {
      setStatusText(
        "Recent call history is not accessible in this browser or device. Add emergency contacts manually instead."
      );
      setPhoneConnectMode("manual");
      setShowContactPicker(true);
      return;
    }

    setStatusText("Requesting access to recent calls...");

    try {
      const payload =
        (typeof api.getRecentCalls === "function" && (await api.getRecentCalls({ maxResults: 5 }))) ||
        (typeof api.getCallHistory === "function" && (await api.getCallHistory({ maxResults: 5 }))) ||
        (typeof api.getCalls === "function" && (await api.getCalls(5))) ||
        (typeof api.getCallLog === "function" && (await api.getCallLog({ limit: 5 }))) ||
        [];

      const recentCalls = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.calls)
          ? payload.calls
          : [];

      const contacts = recentCalls
        .map((entry) => {
          const phone = normalizePhoneNumber(
            entry.phone || entry.number || entry.tel || entry.value || ""
          );
          const name = entry.name || entry.displayName || "Recent contact";
          return { name, phone };
        })
        .map(sanitizeEmergencyContact)
        .filter((contact) => contact.phone.length >= 7)
        .slice(0, 5);

      if (!contacts.length) {
        setStatusText(
          "No recent call numbers were available from this device. Please add emergency contacts manually."
        );
        setPhoneConnectMode("manual");
        setShowContactPicker(true);
        return;
      }

      setRecentCallCandidates(contacts);
      setPhoneConnectMode("review");
      setShowContactPicker(true);
      setStatusText("Review the 5 recent local call numbers before using them for SOS.");
    } catch (error) {
      console.warn("Recent call history access failed:", error);
      setStatusText(
        "Access to recent call history was denied or unavailable. Add emergency contacts manually instead."
      );
      setPhoneConnectMode("manual");
      setShowContactPicker(true);
    }
  };

  const saveManualEmergencyContact = () => {
    const contact = sanitizeEmergencyContact({
      name: manualContactName,
      phone: manualContactPhone,
    });

    if (!contact.phone || contact.phone.length < 7) {
      setStatusText("Enter a valid phone number for the emergency contact.");
      return;
    }

    const merged = [...emergencyContacts, contact].slice(0, 5);
    applyEmergencyContacts(merged);
    setManualContactName("");
    setManualContactPhone("");
    setPhoneConnectMode("choose");
    setShowContactPicker(false);
  };

  const handleOpenCompanionApp = () => {
    setStatusText("Opening phone companion app");

    try {
      window.location.href = "rakshak://pair-device";
    } catch (error) {
      console.warn("Companion deep link failed", error);
    }

    setDeviceAccess((prev) => ({ ...prev, wearables: true }));
    setTimeout(() => {
      setShowContactPicker(false);
      setPhoneConnectMode("choose");
      setStatusText("Connected device app opened. Contacts, GPS, and offline wearable sensors can sync automatically.");
    }, 400);
  };

  const openMap = () => {
    window.open(liveLocation.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const triggerCall = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned) {
      window.location.href = `tel:${cleaned}`;
    }
  };

  const dialEmergencyContacts = () => {
    if (!emergencyContacts.length) {
      setStatusText("No emergency contacts are available. Please add or approve your contact list first.");
      setShowContactPicker(true);
      setPhoneConnectMode("choose");
      return;
    }

    const confirmed = window.confirm("Confirm that you want to initiate emergency calls to the saved SOS contacts?");
    if (!confirmed) {
      setStatusText("Emergency call cancelled by the user.");
      return;
    }

    emergencyContacts.forEach((contact, index) => {
      const cleaned = normalizePhoneNumber(contact.phone);
      if (!cleaned) return;
      setTimeout(() => {
        window.location.href = `tel:${cleaned}`;
      }, index * 1200);
    });
  };

  const createRiskMessage = (contactName = "contact") => {
    const locationText = deviceLocation.lat !== null && deviceLocation.lng !== null
      ? `Current location: https://www.google.com/maps?q=${deviceLocation.lat},${deviceLocation.lng}`
      : "Current location: unavailable right now.";

    return `Emergency alert for ${contactName}: ${profile.fullName || "This person"} is in immediate danger and needs help right now. Please contact them and emergency services urgently. ${locationText} Please respond as soon as possible.`;
  };

  const sendRiskMessageToContact = (contact) => {
    const cleaned = contact.phone.replace(/\D/g, "");
    if (!cleaned) return;
    const body = encodeURIComponent(createRiskMessage(contact.name));
    window.location.href = `sms:${cleaned}?body=${body}`;
  };

  const sendRiskMessageToAllContacts = () => {
    if (!emergencyContacts.length) {
      setStatusText("No emergency contacts are available to receive an SOS message.");
      setShowContactPicker(true);
      setPhoneConnectMode("choose");
      return;
    }

    const confirmed = window.confirm("Confirm that you want to send the emergency SOS SMS to the selected contacts?");
    if (!confirmed) {
      setStatusText("Emergency SMS cancelled by the user.");
      return;
    }

    emergencyContacts.forEach((contact, index) => {
      setTimeout(() => sendRiskMessageToContact(contact), index * 250);
    });
  };

  useEffect(() => {
    setDeviceAccess((prev) => ({ ...prev, contacts: false }));
    setStatusText("No emergency contacts are active yet. Select or add trusted contacts for SOS.");
  }, []);

  useEffect(() => {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeviceLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: "Current device location",
            permission: "granted",
            error: "",
          });
          setDeviceAccess((prev) => ({ ...prev, gps: true }));
        },
        (error) => {
          setDeviceLocation({
            lat: null,
            lng: null,
            label: "Location unavailable",
            permission: "denied",
            error: error.message || "Location access was denied. Enable location access to share the live position.",
          });
          setDeviceAccess((prev) => ({ ...prev, gps: false }));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    } else {
      setDeviceLocation({
        lat: null,
        lng: null,
        label: "Location not supported",
        permission: "unsupported",
        error: "This browser does not support live geolocation. Use a connected mobile device with GPS access.",
      });
      setDeviceAccess((prev) => ({ ...prev, gps: false }));
    }

    setDeviceAccess((prev) => ({ ...prev, wearables: true }));
  }, []);

  useEffect(() => {
    if (isDangerState) {
      const timer = setTimeout(() => {
        dialEmergencyContacts();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isDangerState]);

  const emergencyMapUrl = `https://maps.google.com/maps?q=${liveLocation.lat ?? 19.0760},${liveLocation.lng ?? 72.8777}&z=13&output=embed`;

  const handleTodayStatus = () => {
    setSelectedDay(history.length - 1);
    setStatusText("Today's status refreshed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdjustGoals = () => {
    setStatusText("Goal sync enabled");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const sleepAverage = useMemo(() => average("sleep"), []);
  const recoveryAverage = useMemo(() => average("recovery"), []);
  const focusAverage = useMemo(() => average("focus"), []);
  const stressAverage = useMemo(() => average("stress"), []);

  const score = Math.round(
    current.recovery * 0.35 +
      current.focus * 0.25 +
      (100 - current.stress) * 0.2 +
      (current.sleep / 9) * 100 * 0.2
  );

  const insight = useMemo(() => {
    const sleepDelta = current.sleep - sleepAverage;
    const focusDelta = current.focus - focusAverage;
    const stressDelta = current.stress - stressAverage;

    if (sleepDelta >= 0.7 && focusDelta >= 6 && stressDelta <= -8) {
      return "Your baseline is strongest when you sleep above your weekly average and keep stress below your normal range. Today matches that pattern, so your recovery window looks healthy.";
    }

    if (sleepDelta < -0.8 || focusDelta < -8) {
      return "You are running below your usual baseline. Recovery and focus look softer than your normal rhythm, so a lighter schedule and earlier wind-down would help.";
    }

    return "Your pattern is mostly consistent with your personal cadence. The main opportunity is to protect the recovery window before afternoon stress starts to climb.";
  }, [current, sleepAverage, focusAverage, stressAverage]);

  const actions = [
    {
      title: "Protect sleep",
      detail: current.sleep < 7 ? "Aim for a 30-minute earlier bedtime and reduce evening screen time." : "Your sleep is aligned with your pattern; keep the routine stable.",
      icon: MoonStar,
      color: T.accent,
    },
    {
      title: "Reduce stress drift",
      detail: current.stress > 45 ? "Use a 10-minute reset before 4 PM to lower the spike." : "Stress is in a manageable band for your baseline.",
      icon: Zap,
      color: T.warm,
    },
    {
      title: "Boost focus",
      detail: current.focus < 75 ? "Batch deep work into your first 90 minutes after waking." : "Focus is above trend; keep this momentum in your strongest hours.",
      icon: Brain,
      color: T.accent2,
    },
    {
      title: "Extreme weather guidance",
      detail:
        environment.temp > 30 || environment.airQuality > 45 || environment.uvIndex > 6
          ? "High heat and air stress are detected. Stay hydrated, limit outdoor exposure during peak daytime heat, use cooling measures, and keep emergency contacts ready if symptoms worsen."
          : "Current weather stress is manageable. Continue monitoring humidity and UV levels, and keep hydration and cooling resources available during the hottest part of the day.",
      icon: ShieldCheck,
      color: T.warm,
    },
    {
      title: "Health risk response",
      detail:
        current.stress > 45 || current.sleep < 7 || current.recovery < 70
          ? "Your health trend shows elevated risk. Prioritize rest, reduce exertion, monitor dizziness, chest discomfort, or confusion, and seek medical guidance early if symptoms continue."
          : "Your health signals are stable. Maintain your routine, continue hydration, and monitor for any sudden dizziness, fatigue, or worsening symptoms.",
      icon: HeartPulse,
      color: T.danger,
    },
  ];

  const scoreLabel = scoreFromMetrics(score);
  const personalHealthScore = Math.max(0, Math.min(100, score));

  const environmentScore = Math.min(100, Math.round(
    (100 - environment.airQuality) * 0.35 +
    (100 - environment.temp * 2.2) * 0.25 +
    (100 - environment.humidity) * 0.2 +
    (100 - environment.uvIndex * 8) * 0.2
  ));

  const environmentLabel = environmentScore >= 75 ? "Safe" : environmentScore >= 55 ? "Caution" : "Danger";
  const environmentSeverity = environmentLabel === "Safe" ? "low" : environmentLabel === "Caution" ? "medium" : "high";

  const weatherDangerScore = Math.min(100, Math.round(
    environment.airQuality * 0.32 +
    Math.max(0, environment.temp - 20) * 3.6 +
    environment.humidity * 0.45 +
    environment.uvIndex * 8 +
    (current.stress > 45 ? 14 : 0)
  ));
  const disasterLabel = weatherDangerScore >= 80 ? "Extreme danger" : weatherDangerScore >= 60 ? "High danger" : weatherDangerScore >= 40 ? "Watch" : "Low danger";

  const environmentSummary =
    environment.airQuality > 80 || environment.temp > 32 || environment.uvIndex > 6
      ? "Environmental conditions are elevated today. Heat exposure, air quality stress, and UV load are combining to raise risk for vulnerable users. Recommended actions: increase water intake, avoid peak outdoor heat, wear breathable clothing, keep cooling tools nearby, and limit exertion until conditions improve."
      : "Current environmental conditions remain within a manageable range, with only mild stress signals from the outdoor environment. Keep monitoring heat and AQI during midday and maintain routine hydration and shade breaks when the outdoor environment becomes more intense.";

  const aiHealthMetrics = useMemo(() => {
    const heartRate = Math.round(72 + (current.stress - 40) * 0.22 + (environment.temp - 28) * 0.7);
    const spO2 = Math.min(99, Math.max(94, 98 - (environment.airQuality > 50 ? 1 : 0) - (current.sleep < 7 ? 1 : 0)));
    const bodyTemp = Number((36.6 + (environment.temp - 28) * 0.08 + (current.stress > 45 ? 0.2 : 0)).toFixed(1));
    const respiratoryRate = Math.round(15 + (current.stress > 45 ? 3 : 0) + (environment.temp > 30 ? 2 : 0));
    const activityLevel = Math.min(100, Math.max(24, Math.round((current.focus + current.mood + (current.sleep * 8)) / 2.6)));
    const fatigueIndex = Math.min(100, Math.max(10, Math.round(current.stress * 0.55 + (100 - current.recovery) * 0.45)));
    const sleepQuality = Math.min(100, Math.max(35, Math.round((current.sleep / 8.5) * 100)));
    const readiness = Math.min(100, Math.max(25, Math.round(current.recovery * 0.7 + current.focus * 0.3)));

    return {
      heartRate: Math.max(58, Math.min(110, heartRate)),
      spO2: Number(spO2.toFixed(1)),
      bodyTemp,
      respiratoryRate,
      activityLevel,
      fatigueIndex,
      sleepQuality,
      readiness,
    };
  }, [current, environment]);

  const aiHealthSummary = useMemo(() => {
    if (aiHealthMetrics.fatigueIndex > 70 || aiHealthMetrics.readiness < 55) {
      return "Local AI detects elevated fatigue pressure and reduced recovery readiness. Rest, reduce exertion, and focus on hydration and sleep protection.";
    }

    if (aiHealthMetrics.activityLevel > 75 && aiHealthMetrics.sleepQuality > 70) {
      return "Local AI sees a balanced rhythm with strong recovery and consistent activity. Performance and recovery readiness are aligned.";
    }

    return "Local AI indicates a stable baseline. Continue monitoring for midday stress drift and any changes in sleep or respiratory patterns.";
  }, [aiHealthMetrics]);

  const healthHistoryData = useMemo(() => {
    const liveHealthRate = Math.min(
      100,
      Math.max(
        25,
        Math.round(
          (aiHealthMetrics.readiness * 0.5) +
          (Math.max(0, 100 - aiHealthMetrics.fatigueIndex) * 0.3) +
          (aiHealthMetrics.sleepQuality * 0.2)
        )
      )
    );

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    const historicalPoints = history.map((item, index) => {
      const pointDate = new Date(startDate);
      pointDate.setDate(startDate.getDate() + index);

      const rate = Math.min(
        100,
        Math.max(
          20,
          Math.round(
            (item.recovery * 0.5) +
            (item.focus * 0.25) +
            ((100 - item.stress) * 0.25)
          )
        )
      );

      return {
        dateLabel: pointDate.toLocaleDateString([], { month: "short", day: "numeric" }),
        fullDate: pointDate.toISOString(),
        healthRate: rate,
      };
    });

    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    return [...historicalPoints, { dateLabel: nowDate.toLocaleDateString([], { month: "short", day: "numeric" }), fullDate: nowDate.toISOString(), healthRate: liveHealthRate }];
  }, [aiHealthMetrics]);

  const currentHealthRate = healthHistoryData[healthHistoryData.length - 1]?.healthRate || 0;

  const alertLevelOrder = { Normal: 0, Warning: 1, "High Risk": 2, Critical: 3 };
  const alertColors = {
    Normal: T.good,
    Warning: T.warm,
    "High Risk": T.danger,
    Critical: "#ff4d6d",
  };

  const warningCenterAlerts = useMemo(() => {
    const now = new Date();
    const defaultTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const warnings = [];

    if (aiHealthMetrics.heartRate > 86) {
      const severity = aiHealthMetrics.heartRate > 100 ? "Critical" : aiHealthMetrics.heartRate > 92 ? "High Risk" : "Warning";
      warnings.push({
        risk: "Health Alert",
        severity,
        reason: `Heart rate is ${aiHealthMetrics.heartRate} bpm, above your usual range for this time of day.`,
        action: "Slow down, hydrate, and monitor for dizziness or chest discomfort. Rest if symptoms worsen.",
        time: defaultTime,
      });
    }

    if (aiHealthMetrics.spO2 < 95) {
      const severity = aiHealthMetrics.spO2 < 90 ? "Critical" : aiHealthMetrics.spO2 < 93 ? "High Risk" : "Warning";
      warnings.push({
        risk: "Low SpO₂ Risk",
        severity,
        reason: `Oxygen saturation is ${aiHealthMetrics.spO2}%, below your normal baseline and suggesting reduced respiratory efficiency.`,
        action: "Reduce exertion, sit in a cooler environment, and seek urgent care if the reading stays low.",
        time: defaultTime,
      });
    }

    if (environment.temp > 30 || environment.humidity > 65) {
      const severity = environment.temp > 34 || environment.humidity > 75 ? "Critical" : environment.temp > 31 || environment.humidity > 70 ? "High Risk" : "Warning";
      warnings.push({
        risk: "Heat Wave Risk",
        severity,
        reason: "High environmental temperature detected. Combined heat and humidity are pushing the body toward thermal stress.",
        action: "Stay hydrated, avoid direct sunlight, and move to a cooler location with shade or AC.",
        time: defaultTime,
      });
    }

    if (environment.airQuality > 55 && aiHealthMetrics.respiratoryRate > 18) {
      const severity = environment.airQuality > 80 ? "Critical" : environment.airQuality > 65 ? "High Risk" : "Warning";
      warnings.push({
        risk: "Pollution Risk",
        severity,
        reason: `Poor AQI (${environment.airQuality}) and elevated respiratory rate (${aiHealthMetrics.respiratoryRate}/min) suggest breathing stress.`,
        action: "Limit outdoor exertion, wear a mask when needed, and move to a cleaner-air space.",
        time: defaultTime,
      });
    }

    if (!warnings.length) {
      warnings.push({
        risk: "Stable baseline",
        severity: "Normal",
        reason: "Current readings remain within your normal pattern and do not indicate elevated risk.",
        action: "Continue routine monitoring and keep hydration and recovery habits steady.",
        time: defaultTime,
      });
    }

    return warnings.sort((a, b) => alertLevelOrder[b.severity] - alertLevelOrder[a.severity]);
  }, [aiHealthMetrics, environment]);

  const anomalyAlerts = useMemo(() => {
    const alerts = [];
    const heartRateDelta = aiHealthMetrics.heartRate - 72;
    if (heartRateDelta > 18) {
      const level = heartRateDelta > 30 ? "Critical" : heartRateDelta > 24 ? "High Risk" : "Warning";
      alerts.push({
        id: "heart-rate",
        title: "Health Alert",
        level,
        score: level === "Critical" ? 96 : level === "High Risk" ? 82 : 64,
        detail: `Heart rate is ${aiHealthMetrics.heartRate} bpm, which is ${Math.abs(heartRateDelta).toFixed(0)} bpm above your usual baseline. This can indicate stress, exertion, or cardiovascular strain.`,
      });
    }

    if (aiHealthMetrics.spO2 < 95) {
      const level = aiHealthMetrics.spO2 < 90 ? "Critical" : aiHealthMetrics.spO2 < 93 ? "High Risk" : "Warning";
      alerts.push({
        id: "oxygen",
        title: "Low SpO₂",
        level,
        score: level === "Critical" ? 98 : level === "High Risk" ? 88 : 68,
        detail: `Oxygen saturation is ${aiHealthMetrics.spO2}%, below your normal range. Reduce exertion, monitor breathing, and seek medical attention if it continues to drop.`,
      });
    }

    const heatRisk = environment.temp > 30 || aiHealthMetrics.bodyTemp > 37.8 || environment.humidity > 65;
    if (heatRisk) {
      const level = environment.temp > 34 || aiHealthMetrics.bodyTemp > 38.3 ? "Critical" : environment.temp > 31 || environment.humidity > 70 ? "High Risk" : "Warning";
      alerts.push({
        id: "heat",
        title: "Heat Risk",
        level,
        score: level === "Critical" ? 95 : level === "High Risk" ? 84 : 66,
        detail: `Temperature is ${environment.temp}°C with ${environment.humidity}% humidity, creating a heat-stress pattern beyond your normal baseline. Increase hydration, move to cooler spaces, and limit exertion if symptoms worsen.`,
      });
    }

    if (environment.airQuality > 55 && aiHealthMetrics.respiratoryRate > 18) {
      const level = environment.airQuality > 80 ? "Critical" : environment.airQuality > 65 ? "High Risk" : "Warning";
      alerts.push({
        id: "pollution",
        title: "Pollution Risk",
        level,
        score: level === "Critical" ? 97 : level === "High Risk" ? 86 : 70,
        detail: `AQI is ${environment.airQuality} with a respiratory rate of ${aiHealthMetrics.respiratoryRate}/min, suggesting poor-air exposure may be stressing breathing and recovery. Reduce outdoor exertion and use protection.`,
      });
    }

    if (!alerts.length) {
      alerts.push({
        id: "normal",
        title: "Normal baseline",
        level: "Normal",
        score: 12,
        detail: "Current health and environment readings align with your usual pattern. Continue monitoring and keep your routine stable.",
      });
    }

    return alerts.sort((a, b) => alertLevelOrder[b.level] - alertLevelOrder[a.level]);
  }, [aiHealthMetrics, environment]);

  const primaryAlert = useMemo(
    () => anomalyAlerts.reduce((highest, current) => (
      alertLevelOrder[current.level] > alertLevelOrder[highest.level] ? current : highest
    ), anomalyAlerts[0]),
    [anomalyAlerts]
  );

  const healthAssistantRecommendations = useMemo(() => {
    const issues = [];

    if (aiHealthMetrics.heartRate > 86) {
      issues.push({
        title: "Elevated heart rate",
        level: aiHealthMetrics.heartRate > 100 ? "High" : "Moderate",
        recommendation: aiHealthMetrics.heartRate > 100
          ? "This is a significant cardiovascular stress signal. Stop intense activity, hydrate, breathe slowly, and contact a clinician if chest pain, dizziness, or palpitations continue."
          : "Your heart rate is above your normal pattern. Reduce exertion, take a few minutes of seated rest, and monitor for dizziness or discomfort.",
      });
    }

    if (aiHealthMetrics.spO2 < 95) {
      issues.push({
        title: "Low oxygen saturation",
        level: aiHealthMetrics.spO2 < 90 ? "Critical" : "High",
        recommendation: aiHealthMetrics.spO2 < 90
          ? "Your oxygen level is very low. Place yourself in a cool, calm environment, limit movement, and seek urgent medical evaluation immediately."
          : "Your oxygen saturation is below the usual range. Reduce exertion, sit in cleaner air, and monitor for breathing discomfort or fatigue.",
      });
    }

    if (aiHealthMetrics.bodyTemp > 37.8 || environment.temp > 30) {
      issues.push({
        title: "Thermal stress",
        level: aiHealthMetrics.bodyTemp > 38.3 || environment.temp > 34 ? "High" : "Moderate",
        recommendation: aiHealthMetrics.bodyTemp > 38.3 || environment.temp > 34
          ? "Heat stress is high. Move to a cooler space, drink water or ORS, avoid direct sun, and seek medical help if confusion, vomiting, or severe weakness appears."
          : "Temperature is above your usual comfort range. Reduce outdoor activity, keep hydrating, and take cooling breaks in shade or indoors.",
      });
    }

    if (current.stress > 50 || aiHealthMetrics.fatigueIndex > 65) {
      issues.push({
        title: "Stress and fatigue build-up",
        level: current.stress > 70 || aiHealthMetrics.fatigueIndex > 80 ? "High" : "Moderate",
        recommendation: current.stress > 70 || aiHealthMetrics.fatigueIndex > 80
          ? "Stress and fatigue are elevated enough to affect decision-making and recovery. Pause demanding tasks, breathe deeply, and prioritize rest before continuing."
          : "Your stress load is moderately high. Use a short reset break, reduce screen time, and maintain a calmer pace for the next few hours.",
      });
    }

    if (environment.airQuality > 55) {
      issues.push({
        title: "Poor air quality",
        level: environment.airQuality > 80 ? "High" : "Moderate",
        recommendation: environment.airQuality > 80
          ? "Air quality is unhealthy. Avoid outside exertion, wear a mask, and move to cleaner indoor air if you are coughing, wheezing, or feeling short of breath."
          : "AQI is elevated. Reduce strenuous outdoor activity, keep masks available, and prioritize cleaner-air spaces when possible.",
      });
    }

    if (!issues.length) {
      return [{
        title: "Healthy baseline",
        level: "Normal",
        recommendation: "Current readings are within your normal range. Keep your hydration, sleep, and recovery routine steady, and continue monitoring for any sudden changes.",
      }];
    }

    return issues.slice(0, 4);
  }, [aiHealthMetrics, current, environment]);

  const aiAssistantSummary = useMemo(() => {
    const topIssue = healthAssistantRecommendations[0];
    const issueCount = healthAssistantRecommendations.length;

    if (!topIssue || topIssue.level === "Normal") {
      return "Your current health pattern looks stable. Continue your hydration, sleep, and stress-management routine, and keep monitoring for any sudden change.";
    }

    return `Your AI health assistant is seeing ${issueCount} active concern${issueCount > 1 ? "s" : ""}. The most urgent issue is ${topIssue.title.toLowerCase()}, and the best next step is to ${topIssue.recommendation.toLowerCase()}`;
  }, [healthAssistantRecommendations]);

  const assistantPriorityBanner = useMemo(() => {
    const topIssue = healthAssistantRecommendations[0];
    if (!topIssue || topIssue.level === "Normal") {
      return { title: "Everything looks stable", detail: "Continue your normal routine and keep monitoring for sudden changes.", tone: "normal" };
    }

    if (topIssue.level === "Critical") {
      return { title: `${topIssue.title} — urgent care is recommended`, detail: topIssue.recommendation, tone: "critical" };
    }

    if (topIssue.level === "High") {
      return { title: `${topIssue.title} — act now`, detail: topIssue.recommendation, tone: "high" };
    }

    return { title: `${topIssue.title} — monitor closely`, detail: topIssue.recommendation, tone: "moderate" };
  }, [healthAssistantRecommendations]);

  const urgentCareSteps = useMemo(() => {
    const steps = [];

    if (aiHealthMetrics.spO2 < 90 || aiHealthMetrics.heartRate > 100 || aiHealthMetrics.bodyTemp > 38.3) {
      steps.push("Seek urgent medical attention immediately if symptoms are severe, persistent, or worsening.");
    }

    if (environment.temp > 34 || environment.airQuality > 80) {
      steps.push("Move to a cooler, cleaner indoor space and avoid prolonged outdoor exposure until the risk drops.");
    }

    if (current.stress > 70 || aiHealthMetrics.fatigueIndex > 80) {
      steps.push("Pause demanding tasks and use a recovery reset with hydration, breathing, and a calmer environment.");
    }

    if (!steps.length) {
      steps.push("Continue close monitoring and maintain your current recovery routine.");
    }

    return steps;
  }, [aiHealthMetrics, current, environment]);

  const anomalyScore = Math.min(100, Math.round(primaryAlert.score));
  const anomalyStatus = primaryAlert.level;

  const disasterSafetyModules = [
    {
      id: "heat-waves",
      title: "Heat waves",
      level: environment.temp > 34 || environment.extremeHeat > 75 ? "High" : environment.temp > 30 ? "Moderate" : "Watch",
      warning: environment.temp > 34 || environment.extremeHeat > 75
        ? "Heatwave conditions are active. The heat index is high enough to trigger dehydration and heat stress very quickly."
        : environment.temp > 30
          ? "Heat is elevated. Outdoor exposure should be reduced during the hottest hours of the day."
          : "Heat remains manageable, but early hydration and shade still matter during peak daytime hours.",
      instructions: [
        "Drink water even before you feel thirsty and keep ORS or electrolyte sachets available.",
        "Avoid direct sun between 12:00 PM and 4:00 PM whenever possible.",
        "Wear loose cotton clothing and take cool-down breaks in shaded or air-conditioned spaces."
      ],
      emergencyActions: [
        "Move immediately to a cooler place if you feel dizziness, faintness, or confusion.",
        "Call emergency contacts and monitor for vomiting, severe weakness, or rapid pulse.",
        "Seek urgent medical care if symptoms continue or worsen."
      ],
    },
    {
      id: "floods",
      title: "Floods",
      level: environment.floodRisk > 70 ? "High" : environment.floodRisk > 40 ? "Moderate" : "Watch",
      warning: environment.floodRisk > 70
        ? "Flood risk is high. Waterlogging and sudden overflow are likely in low-lying areas."
        : environment.floodRisk > 40
          ? "Flood risk is building. Roads, drains, and underpasses may become unsafe."
          : "Flood risk is currently limited, but short bursts of rain could still create local waterlogging.",
      instructions: [
        "Avoid low-lying routes, underpasses, and fast-flowing drains during heavy rain.",
        "Keep emergency supplies and a dry bag with phones, documents, and medicines ready.",
        "Move valuables to higher ground and stay updated through local weather alerts."
      ],
      emergencyActions: [
        "Leave flooded roads immediately and do not attempt to walk through standing water.",
        "Call family and emergency contacts to confirm safe shelter and transport plans.",
        "Report blockages or rescue needs to local emergency services without delay."
      ],
    },
    {
      id: "severe-weather",
      title: "Severe weather",
      level: environment.humidity > 75 || environment.floodRisk > 60 ? "High" : environment.humidity > 65 ? "Moderate" : "Watch",
      warning: environment.humidity > 75 || environment.floodRisk > 60
        ? "Strong storm pressure is building. Heavy rain, lightning, and strong gusts could disrupt travel and outdoor activity."
        : environment.humidity > 65
          ? "Storm conditions are becoming more likely. Continue monitoring for sudden changes in wind and rain."
          : "Conditions are stable, but brief severe weather events can still appear during active monsoon periods.",
      instructions: [
        "Stay away from open ground, trees, poles, and waterlogged streets during lightning risk.",
        "Keep phones charged and emergency numbers saved in a ready-access list.",
        "Delay travel until severe weather warnings are lifted or the route is clearly safe."
      ],
      emergencyActions: [
        "Move to a sturdy shelter and avoid isolated outdoor areas immediately when storm alerts are issued.",
        "Use emergency SMS or call chains to notify family and check on vulnerable relatives.",
        "If winds are dangerous or roads are blocked, wait for official safety guidance before moving."
      ],
    },
    {
      id: "extreme-temperatures",
      title: "Extreme temperatures",
      level: environment.temp > 38 || environment.extremeHeat > 85 ? "High" : environment.temp > 32 ? "Moderate" : "Watch",
      warning: environment.temp > 38 || environment.extremeHeat > 85
        ? "Extreme temperature exposure is serious and can trigger dehydration, heat cramps, and heat exhaustion quickly."
        : environment.temp > 32
          ? "Temperature is above the comfort band, so heat protection should be prioritized through the afternoon."
          : "Extreme temperature risk is currently low, but continued monitoring is still recommended during peak heat periods.",
      instructions: [
        "Keep a water bottle with you and replace fluids regularly, especially after exertion.",
        "Reduce heavy physical work during peak daytime temperatures and rest in shaded areas.",
        "Check for warning signs like dizziness, dry mouth, headache, or rapid heartbeat."
      ],
      emergencyActions: [
        "Stop activity, rest in a cool place, and hydrate immediately if heat symptoms begin.",
        "Call for help if confusion, vomiting, fainting, or very high body temperature occurs.",
        "Avoid alcohol and caffeine when overheating; they can worsen dehydration."
      ],
    },
    {
      id: "pollution-events",
      title: "Pollution events",
      level: environment.airQuality > 80 ? "High" : environment.airQuality > 55 ? "Moderate" : "Watch",
      warning: environment.airQuality > 80
        ? "Air quality is unhealthy for prolonged exposure. Sensitive groups should avoid outdoor activity immediately."
        : environment.airQuality > 55
          ? "AQI is elevated and breathing stress is more likely during outdoor exertion."
          : "Air pollution remains manageable, but protective habits are still helpful during smoke or dust episodes.",
      instructions: [
        "Wear a properly fitted mask if you need to go outdoors during polluted conditions.",
        "Limit vigorous outdoor activity and keep windows closed in high-AQI periods.",
        "Use a cleaner indoor area for rest and recovery whenever possible."
      ],
      emergencyActions: [
        "Move to cleaner air immediately if wheezing, chest tightness, or shortness of breath starts.",
        "Notify family or caregivers if vulnerable people are exposed to poor air conditions.",
        "Seek medical care if breathing becomes difficult or symptoms progress."
      ],
    },
    {
      id: "india-common-disasters",
      title: "Other common India disasters",
      level: environment.floodRisk > 65 || environment.airQuality > 70 ? "High" : environment.humidity > 70 ? "Moderate" : "Watch",
      warning: environment.floodRisk > 65 || environment.airQuality > 70
        ? "Condition patterns align with India’s common seasonal risks such as heavy rain, urban flooding, and smoke-heavy air events."
        : environment.humidity > 70
          ? "Monsoon conditions are active and can increase storm, flood, and travel disruption risk in vulnerable areas."
          : "No major incident is currently active, but regional monsoon or pollution surges can still appear quickly.",
      instructions: [
        "Prepare for local monsoon warnings, power cuts, blocked roads, and sudden weather changes.",
        "Store basic emergency supplies such as water, dry food, torchlight, and medicines in one place.",
        "Check neighborhood alerts for cyclones, storms, road blockages, heat surges, and smoke conditions."
      ],
      emergencyActions: [
        "Activate your family contact list and confirm everyone is in a safe place.",
        "Use local emergency services or local administration guidance when roads are blocked or shelters are needed.",
        "Move to the nearest safe indoor structure immediately in severe weather or flood situations."
      ],
    },
  ];

  const tabConfig = [
    { id: "ai", label: "AI health monitor", icon: Brain },
    { id: "anomaly", label: "Real-time anomaly detection", icon: Activity },
    { id: "warnings", label: "Early Warning Center", icon: ShieldCheck },
    { id: "disaster", label: "Disaster mode", icon: ShieldCheck },
    { id: "environment", label: "Environment overview", icon: ShieldCheck },
    { id: "overall", label: "Psychological + environment", icon: Brain },
    { id: "emergency", label: "Emergency", icon: Activity },
  ];

  const overviewConfig = {
    ai: {
      header: "AI health monitor",
      score: aiHealthMetrics.readiness,
      scoreLabel: aiHealthMetrics.readiness >= 75 ? "Ready" : aiHealthMetrics.readiness >= 55 ? "Stable" : "Watch",
      badgeColor: aiHealthMetrics.readiness >= 75 ? T.good : aiHealthMetrics.readiness >= 55 ? T.accent : T.warm,
      metrics: [
        { label: "Heart rate", value: `${aiHealthMetrics.heartRate} bpm`, icon: HeartPulse, color: T.accent },
        { label: "SpO₂", value: `${aiHealthMetrics.spO2}%`, icon: Activity, color: T.accent2 },
        { label: "Body temp", value: `${aiHealthMetrics.bodyTemp.toFixed(1)}°C`, icon: Thermometer, color: T.warm },
        { label: "Readiness", value: `${aiHealthMetrics.readiness}/100`, icon: Brain, color: T.good },
      ],
      cards: [
        { title: "Local AI status", detail: aiHealthSummary, value: `${aiHealthMetrics.readiness}`, suffix: "", meta: "Readiness", icon: Brain, color: "rgba(78,226,199,0.14)" },
        { title: "Fatigue index", detail: `Current fatigue pressure is ${aiHealthMetrics.fatigueIndex} based on stress and recovery balance.`, value: `${aiHealthMetrics.fatigueIndex}`, suffix: "", meta: "Fatigue", icon: Zap, color: "rgba(255,191,105,0.12)" },
        { title: "Sleep quality", detail: `Sleep quality remains ${aiHealthMetrics.sleepQuality} and is a strong input for your next recovery cycle.`, value: `${aiHealthMetrics.sleepQuality}`, suffix: "", meta: "Sleep signal", icon: MoonStar, color: "rgba(139,124,246,0.12)" },
      ],
    },
    anomaly: {
      header: "Real-time anomaly detection",
      score: anomalyScore,
      scoreLabel: anomalyStatus,
      badgeColor: anomalyScore >= 75 ? T.danger : anomalyScore >= 45 ? T.warm : T.good,
      metrics: [
        { label: "HR variance", value: `${Math.max(0, 100 - current.recovery)}%`, icon: Activity, color: T.danger },
        { label: "Sleep drift", value: `${current.sleep < 7 ? (7 - current.sleep).toFixed(1) : "0.0"}h`, icon: MoonStar, color: T.accent },
        { label: "Stress rise", value: `${current.stress}/100`, icon: Gauge, color: T.warm },
        { label: "Weather stress", value: `${environment.airQuality} AQI`, icon: ShieldCheck, color: T.accent2 },
      ],
      cards: [
        { title: "Recovery drop", detail: `Recovery has fallen ${Math.max(0, recoveryAverage - current.recovery).toFixed(0)} points from the usual trend.`, value: `${Math.max(0, recoveryAverage - current.recovery).toFixed(0)}`, suffix: "pts", meta: "Trend gap", icon: HeartPulse, color: "rgba(255,107,107,0.12)" },
        { title: "Sleep anomaly", detail: current.sleep < 7 ? "Your sleep is below the recommended range and may be reducing your alertness and recovery." : "Sleep remains within a stable range with no clear anomaly detected.", value: `${current.sleep.toFixed(1)}`, suffix: "h", meta: "Sleep track", icon: MoonStar, color: "rgba(78,226,199,0.14)" },
        { title: "Thermal stress", detail: environment.temp > 30 ? `Heat stress is rising at ${environment.temp}°C and may increase fatigue or dehydration risk.` : "Temperature remains comparatively safe and not currently causing thermal stress.", value: `${environment.temp}`, suffix: "°C", meta: "Heat signal", icon: ShieldCheck, color: "rgba(255,191,105,0.13)" },
      ],
    },
    warnings: {
      header: "Early Warning Center",
      score: anomalyScore,
      scoreLabel: anomalyStatus,
      badgeColor: anomalyScore >= 75 ? T.danger : anomalyScore >= 45 ? T.warm : T.good,
      metrics: [
        { label: "Active risks", value: `${warningCenterAlerts.length}`, icon: ShieldCheck, color: T.accent },
        { label: "Max severity", value: anomalyStatus, icon: Activity, color: T.danger },
        { label: "Air stress", value: `${environment.airQuality} AQI`, icon: Activity, color: T.accent2 },
        { label: "Heat stress", value: `${environment.temp}°C`, icon: Thermometer, color: T.warm },
      ],
      cards: warningCenterAlerts.slice(0, 3).map((warning) => ({
        title: warning.risk,
        detail: warning.reason,
        value: warning.severity,
        suffix: "",
        meta: warning.action,
        icon: warning.severity === "Normal" ? CheckCircle2 : warning.severity === "Warning" ? AlertTriangle : ShieldCheck,
        color: warning.severity === "Normal" ? "rgba(96,227,154,0.12)" : warning.severity === "Warning" ? "rgba(255,191,105,0.12)" : "rgba(255,107,107,0.12)",
      })),
    },
    disaster: {
      header: "Disaster mode",
      score: weatherDangerScore,
      scoreLabel: disasterLabel,
      badgeColor: weatherDangerScore >= 80 ? T.danger : weatherDangerScore >= 60 ? T.warm : weatherDangerScore >= 40 ? T.accent : T.good,
      metrics: [
        { label: "Heat", value: `${environment.temp}°C`, icon: ShieldCheck, color: T.warm },
        { label: "Air", value: `${environment.airQuality} AQI`, icon: Activity, color: T.accent },
        { label: "Humidity", value: `${environment.humidity}%`, icon: MoonStar, color: T.accent2 },
        { label: "UV", value: `${environment.uvIndex}/10`, icon: Sparkles, color: T.good },
      ],
      cards: [
        { title: "Weather danger", detail: `The local weather trend is currently ${disasterLabel.toLowerCase()} based on heat, air quality, humidity, and UV conditions.`, value: `${weatherDangerScore}`, suffix: "", meta: "Danger score", icon: ShieldCheck, color: "rgba(255,107,107,0.12)" },
        { title: "Heat risk", detail: environment.temp > 30 ? "Heat exposure is elevated; avoid outdoor work during peak hours and keep cooling options nearby." : "Heat remains manageable, but stay hydrated during the hottest part of the day.", value: `${environment.temp}`, suffix: "°C", meta: "Temperature", icon: Thermometer, color: "rgba(255,191,105,0.12)" },
        { title: "Air protection", detail: environment.airQuality > 45 ? "Air stress is elevated. Mask up and reduce outdoor exertion when AQI remains high." : "Air conditions are relatively stable, but continue monitoring during the afternoon peak.", value: `${environment.airQuality}`, suffix: "AQI", meta: "Air signal", icon: Activity, color: "rgba(78,226,199,0.14)" },
      ],
    },
    environment: {
      header: "Environment overview",
      score: environmentScore,
      scoreLabel: environmentLabel,
      badgeColor: environmentLabel === "Safe" ? T.good : environmentLabel === "Caution" ? T.warm : T.danger,
      metrics: [
        { label: "Air", value: `${environment.airQuality} AQI`, icon: Activity, color: T.accent },
        { label: "Heat", value: `${environment.temp}°C`, icon: ShieldCheck, color: T.warm },
        { label: "Humidity", value: `${environment.humidity}%`, icon: MoonStar, color: T.accent2 },
        { label: "UV", value: `${environment.uvIndex}/10`, icon: Sparkles, color: T.good },
      ],
      cards: [
        { title: "Air quality", detail: `Air quality is currently ${environment.airQuality} AQI with ${environment.airQuality > 45 ? "elevated risk" : "manageable conditions"}.`, value: `${environment.airQuality}`, suffix: "AQI", meta: "Current level", icon: Activity, color: "rgba(78,226,199,0.14)" },
        { title: "Heat index", detail: `Heat stress is ${environment.temp > 30 ? "elevated" : "moderate"} at ${environment.temp}°C.`, value: `${environment.temp}`, suffix: "°C", meta: "Peak temp", icon: ShieldCheck, color: "rgba(255,191,105,0.12)" },
        { title: "UV index", detail: `UV is ${environment.uvIndex}/10, so outdoor protection is ${environment.uvIndex > 6 ? "recommended" : "still manageable"}.`, value: `${environment.uvIndex}`, suffix: "/10", meta: "UV load", icon: Sparkles, color: "rgba(139,124,246,0.12)" },
      ],
    },
    overall: {
      header: "Psychological + environment",
      score: environmentScore,
      scoreLabel: environmentLabel,
      badgeColor: environmentLabel === "Safe" ? T.good : environmentLabel === "Caution" ? T.warm : T.danger,
      metrics: [
        { label: "Focus", value: `${current.focus}/100`, icon: Brain, color: T.accent },
        { label: "Mood", value: `${current.mood}/100`, icon: Sparkles, color: T.warm },
        { label: "Stress", value: `${current.stress}/100`, icon: Gauge, color: T.accent2 },
        { label: "Environment", value: `${environmentScore}/100`, icon: ShieldCheck, color: T.good },
      ],
      cards: [
        { title: "Focus score", detail: `Your focus score is ${current.focus}, aligned with ${current.focus >= 75 ? "high productivity" : "a recovery-focused schedule"}.`, value: `${current.focus}`, suffix: "", meta: "Focus load", icon: Brain, color: "rgba(78,226,199,0.14)" },
        { title: "Mood state", detail: `Current mood state is ${current.mood}, which is ${current.mood >= 75 ? "positive" : "stable but needs support"}.`, value: `${current.mood}`, suffix: "", meta: "Mood index", icon: Sparkles, color: "rgba(255,191,105,0.12)" },
        { title: "Environment score", detail: `${environmentSummary}`, value: `${environmentScore}`, suffix: "", meta: "Risk status", icon: ShieldCheck, color: "rgba(139,124,246,0.12)" },
      ],
    },
    emergency: {
      header: "Emergency response",
      score: isDangerState ? 82 : 90,
      scoreLabel: isDangerState ? "High alert" : "Prepared",
      badgeColor: isDangerState ? T.danger : T.good,
      metrics: [
        { label: "Alert", value: isDangerState ? "High" : "Low", icon: HeartPulse, color: T.danger },
        { label: "Wait", value: isDangerState ? "Auto-call" : "Ready", icon: ShieldCheck, color: T.good },
        { label: "Area", value: liveLocation.label, icon: Activity, color: T.accent },
        { label: "Contacts", value: "5", icon: PhoneCall, color: T.warm },
      ],
      cards: [
        { title: "Health alert", detail: current.stress > 45 || current.recovery < 70 ? "Stress or recovery risk requires immediate rest and hydration." : "Health status is stable and ready for monitoring.", value: current.stress > 45 || current.recovery < 70 ? "Risk" : "Stable", suffix: "", meta: "Current status", icon: HeartPulse, color: "rgba(255,107,107,0.12)" },
        { title: "Environment alert", detail: environment.temp > 30 || environment.airQuality > 45 ? "Heat and air conditions are elevated and need immediate shelter." : "Environment remains manageable with normal monitoring.", value: environment.temp > 30 || environment.airQuality > 45 ? "Watch" : "Normal", suffix: "", meta: "Risk status", icon: ShieldCheck, color: "rgba(255,191,105,0.12)" },
        { title: "Emergency contacts", detail: "Five priority contacts are automatically dialed during critical danger conditions.", value: "5", suffix: "", meta: "Dial list", icon: Activity, color: "rgba(78,226,199,0.14)" },
      ],
    },
  };

  const renderTabContent = () => {
    if (activeTab === "ai") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>On-device AI health monitor</h2>
              <div className="panel-copy">Local inference only</div>
            </div>

            <div className="alert-box" style={{ margin: 0, borderColor: "rgba(78,226,199,0.35)", background: "rgba(78,226,199,0.08)", animation: "none" }}>
              <div className="alert-header">
                <h3>Private local analysis</h3>
                <div className="alert-badge" style={{ background: "rgba(78,226,199,0.12)", borderColor: "rgba(78,226,199,0.32)", color: T.accent }}>On device</div>
              </div>
              <div className="sms-box" style={{ marginTop: 14, background: "rgba(255,255,255,0.02)", borderColor: T.borderSoft }}>
                Sensitive health data stays on this phone or wearable. Rakshak performs the AI analysis locally and does not upload your physiological data to a server.
              </div>
            </div>

            <div className="signal-list" style={{ padding: 0, marginTop: 18 }}>
              {[
                ["Heart rate", `${aiHealthMetrics.heartRate} bpm`, `${Math.min(100, Math.max(30, aiHealthMetrics.heartRate - 40))}%`, "linear-gradient(90deg, #4ee2c7, #7ee4d0)"],
                ["SpO₂", `${aiHealthMetrics.spO2}%`, `${Math.min(100, Math.max(20, aiHealthMetrics.spO2 - 88))}%`, "linear-gradient(90deg, #8b7cf6, #a7a0ff)"],
                ["Body temp", `${aiHealthMetrics.bodyTemp.toFixed(1)}°C`, `${Math.min(100, Math.max(25, (aiHealthMetrics.bodyTemp - 36) * 30))}%`, "linear-gradient(90deg, #ffbf69, #ffd08a)"],
                ["Respiratory rate", `${aiHealthMetrics.respiratoryRate}/min`, `${Math.min(100, aiHealthMetrics.respiratoryRate * 5)}%`, "linear-gradient(90deg, #6ec6ff, #8b7cf6)"],
              ].map(([label, metric, value, color], index) => (
                <div className="signal-row" key={label} style={{ marginBottom: index < 3 ? 10 : 0 }}>
                  <span className="signal-label">{label}</span>
                  <div className="signal-right">
                    <div className="progress"><span style={{ width: `${Math.min(100, Number(value.replace(/%$/, "")) || 0)}%`, background: color }} /></div>
                    <div className="signal-score">{metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>AI interpretation</h2>
              <div className="panel-copy">Adaptive health model</div>
            </div>

            <div className="focus-check" style={{ marginTop: 0 }}>
              <div className="check-item">
                <div className="big" style={{ color: T.accent }}>{aiHealthMetrics.activityLevel}</div>
                <div className="label">Activity level</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.warm }}>{aiHealthMetrics.fatigueIndex}</div>
                <div className="label">Fatigue index</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.accent2 }}>{aiHealthMetrics.sleepQuality}</div>
                <div className="label">Sleep quality</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.good }}>{aiHealthMetrics.readiness}</div>
                <div className="label">Readiness</div>
              </div>
            </div>

            <div className="insight-box" style={{ margin: "18px 0 0" }}>
              <div className="tag">Local AI summary</div>
              <p>{aiHealthSummary}</p>
            </div>

            <div className="panel" style={{ padding: 16, marginTop: 18, background: "rgba(255,255,255,0.02)" }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2>Health history monitor</h2>
                <div className="panel-copy">Continuous health trend</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div className="panel-copy" style={{ marginBottom: 4 }}>Current health rate</div>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.06em" }}>{currentHealthRate}%</div>
                </div>
                <div className="alert-badge" style={{ background: currentHealthRate >= 75 ? "rgba(96,227,154,0.12)" : currentHealthRate >= 55 ? "rgba(255,191,105,0.12)" : "rgba(255,107,107,0.12)", borderColor: currentHealthRate >= 75 ? "rgba(96,227,154,0.30)" : currentHealthRate >= 55 ? "rgba(255,191,105,0.32)" : "rgba(255,107,107,0.36)", color: currentHealthRate >= 75 ? T.good : currentHealthRate >= 55 ? T.warm : T.danger }}>
                  {currentHealthRate >= 75 ? "Healthy" : currentHealthRate >= 55 ? "Watch" : "Low"}
                </div>
              </div>

              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <AreaChart data={healthHistoryData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="healthRateFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4ee2c7" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#4ee2c7" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="dateLabel" tick={{ fill: "#9bb6bf", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[20, 100]} tick={{ fill: "#9bb6bf", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value) => [`${value}%`, "Health rate"]}
                      contentStyle={{ background: "#0a1c2b", border: "1px solid rgba(78,226,199,0.35)", borderRadius: 12, color: "#eaf7f8" }}
                    />
                    <Area type="monotone" dataKey="healthRate" stroke="#4ee2c7" strokeWidth={3} fill="url(#healthRateFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="action-list" style={{ margin: "18px 0 0" }}>
              {[
                { title: "Physiological stability", detail: aiHealthMetrics.readiness >= 70 ? "Your body metrics are stable and recovery is trending well." : "Recovery pressure is elevated. Prioritize rest and lower-demand activity.", icon: HeartPulse, color: T.good },
                { title: "Stress / fatigue signal", detail: aiHealthMetrics.fatigueIndex > 60 ? "Fatigue is rising. Avoid overexertion and use a quieter recovery window." : "Fatigue remains manageable with your current rhythm.", icon: Zap, color: T.warm },
                { title: "Breathing and oxygen", detail: `SpO₂ is ${aiHealthMetrics.spO2}% with a ${aiHealthMetrics.respiratoryRate}/min breathing rhythm, which is within a stable range for routine monitoring.`, icon: Activity, color: T.accent },
                { title: "Data privacy", detail: "Your passport of health metrics is analyzed on-device and never uploaded to a remote server for inference.", icon: Lock, color: T.accent2 },
              ].map(({ title, detail, icon: Icon, color }) => (
                <div className="action-item" key={title}>
                  <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                  <div>
                    <h4>{title}</h4>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel" style={{ padding: 18, marginTop: 18 }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2>AI health assistant</h2>
                <div className="panel-copy">Personalized guidance</div>
              </div>

              <div className="alert-box" style={{ margin: "0 0 18px", padding: 20, borderColor: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.38)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.38)" : "rgba(78,226,199,0.32)", background: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.08)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.08)" : "rgba(78,226,199,0.08)", boxShadow: assistantPriorityBanner.tone === "critical" ? "0 0 0 1px rgba(255,107,107,0.18), 0 14px 36px rgba(255,107,107,0.12)" : assistantPriorityBanner.tone === "high" ? "0 0 0 1px rgba(255,191,105,0.18), 0 14px 36px rgba(255,191,105,0.12)" : "0 0 0 1px rgba(78,226,199,0.14), 0 14px 30px rgba(78,226,199,0.08)" }}>
                <div className="alert-header" style={{ alignItems: "center" }}>
                  <h3 style={{ fontSize: 20, lineHeight: 1.25, margin: 0 }}>{assistantPriorityBanner.title}</h3>
                  <div className="alert-badge" style={{ background: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.12)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.12)" : "rgba(78,226,199,0.12)", borderColor: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.34)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.34)" : "rgba(78,226,199,0.28)", color: assistantPriorityBanner.tone === "critical" ? T.danger : assistantPriorityBanner.tone === "high" ? T.warm : T.good, padding: "8px 10px", fontSize: 11 }}>{assistantPriorityBanner.tone === "critical" ? "Urgent" : assistantPriorityBanner.tone === "high" ? "Act now" : "Monitor"}</div>
                </div>
                <div className="sms-box" style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>{assistantPriorityBanner.detail}</div>
              </div>

              <div className="insight-box" style={{ margin: "0 0 18px" }}>
                <div className="tag">AI summary</div>
                <p>{aiAssistantSummary}</p>
              </div>

              <div className="action-list" style={{ margin: 0 }}>
                {healthAssistantRecommendations.map((issue) => (
                  <div className="action-item" key={issue.title}>
                    <div className="action-icon" style={{ background: issue.level === "Critical" || issue.level === "High" ? "rgba(255,107,107,0.12)" : issue.level === "Moderate" ? "rgba(255,191,105,0.12)" : "rgba(78,226,199,0.12)", color: issue.level === "Critical" || issue.level === "High" ? T.danger : issue.level === "Moderate" ? T.warm : T.good }}>
                      {issue.level === "Critical" || issue.level === "High" ? <HeartPulse size={18} /> : issue.level === "Moderate" ? <ShieldCheck size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div>
                      <h4>{issue.title}</h4>
                      <p style={{ margin: 0 }}><strong style={{ color: T.text }}>{issue.level}</strong> — {issue.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ padding: 14, marginTop: 18, background: "rgba(255,255,255,0.02)" }}>
                <div className="panel-copy" style={{ marginBottom: 10 }}>What to do now</div>
                <div className="action-list" style={{ margin: 0 }}>
                  {urgentCareSteps.map((step, index) => (
                    <div className="action-item" key={`step-${index}`} style={{ marginBottom: 8 }}>
                      <div className="action-icon" style={{ background: "rgba(78,226,199,0.12)", color: T.accent }}><CheckCircle2 size={16} /></div>
                      <div>
                        <p style={{ margin: 0 }}>{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" style={{ padding: 14, marginTop: 18, background: "rgba(255,107,107,0.04)" }}>
                <div className="panel-copy" style={{ marginBottom: 10 }}>When to seek urgent care</div>
                <div className="action-list" style={{ margin: 0 }}>
                  {[
                    "Chest pain, fainting, confusion, or severe shortness of breath.",
                    "Persistent dizziness, vomiting, or sudden weakness that does not improve with rest.",
                    "Very low oxygen readings, very high body temperature, or rapidly worsening heat symptoms.",
                    "Breathing trouble, severe allergic symptoms, or emergency signs during a pollution or heat event.",
                  ].map((item, index) => (
                    <div className="action-item" key={`urgent-${index}`} style={{ marginBottom: 8 }}>
                      <div className="action-icon" style={{ background: "rgba(255,107,107,0.12)", color: T.danger }}><HeartPulse size={16} /></div>
                      <div>
                        <p style={{ margin: 0 }}>{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "anomaly") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>AI anomaly detection</h2>
              <div className="panel-copy">Baseline comparison</div>
            </div>

            <div className="alert-box" style={{ margin: 0, borderColor: alertColors[primaryAlert.level] === T.good ? "rgba(96,227,154,0.32)" : alertColors[primaryAlert.level] === T.warm ? "rgba(255,191,105,0.32)" : "rgba(255,107,107,0.32)", background: primaryAlert.level === "Normal" ? "rgba(96,227,154,0.08)" : primaryAlert.level === "Warning" ? "rgba(255,191,105,0.08)" : "rgba(255,107,107,0.08)" }}>
              <div className="alert-header">
                <h3>{primaryAlert.title}</h3>
                <div className="alert-badge" style={{ background: `${alertColors[primaryAlert.level]}18`, borderColor: `${alertColors[primaryAlert.level]}55`, color: alertColors[primaryAlert.level] }}>{primaryAlert.level}</div>
              </div>
              <div className="sms-box" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)", borderColor: T.borderSoft }}>
                {primaryAlert.detail}
              </div>
            </div>

            <div className="signal-list" style={{ padding: 0, marginTop: 18 }}>
              {anomalyAlerts.map((alert) => (
                <div className="signal-row" key={alert.id} style={{ marginBottom: 10 }}>
                  <span className="signal-label">{alert.title}</span>
                  <div className="signal-right">
                    <div className="progress"><span style={{ width: `${Math.min(100, alert.score)}%`, background: alertColors[alert.level] }} /></div>
                    <div className="signal-score" style={{ color: alertColors[alert.level] }}>{alert.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Recommended anomaly response</h2>
              <div className="panel-copy">Immediate guidance</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {[
                { title: "Protect recovery", detail: current.recovery < 70 ? "Take a slower pace today and restore recovery before the next activity block." : "Recovery remains acceptable; keep your current rhythm steady.", icon: HeartPulse, color: T.accent },
                { title: "Reduce cognitive load", detail: current.focus < 75 ? "Schedule deep work earlier and minimize decision fatigue during the next few hours." : "Your focus pattern is stable; keep your current rhythm.", icon: Brain, color: T.accent2 },
                { title: "Stabilize stress", detail: current.stress > 45 ? "Use a 10-minute reset and reduce overload in the next cycle before it compounds." : "Stress is controlled and predictable.", icon: Zap, color: T.warm },
                { title: "Cool and recover", detail: environment.temp > 30 ? "Avoid peak heat and hydrate more often to prevent thermal strain." : "Conditions are manageable; continue general hydration and caution.", icon: ShieldCheck, color: T.danger },
              ].map(({ title, detail, icon: Icon, color }) => (
                <div className="action-item" key={title}>
                  <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                  <div>
                    <h4>{title}</h4>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "warnings") {
      return (
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Early Warning Center</h2>
              <div className="panel-copy">Potential risks before they become emergencies</div>
            </div>

            <div className="severity-legend">
              <span className="legend-pill"><span className="legend-swatch" style={{ background: T.good }} /> Normal</span>
              <span className="legend-pill"><span className="legend-swatch" style={{ background: T.warm }} /> Warning</span>
              <span className="legend-pill"><span className="legend-swatch" style={{ background: T.danger }} /> High Risk</span>
              <span className="legend-pill"><span className="legend-swatch" style={{ background: "#ff4d6d" }} /> Critical</span>
            </div>

            <div className="status-strip" style={{ marginTop: 12 }}>
              <div className="status-card">
                <div className="status-label">Risk detected</div>
                <div className="status-value" style={{ fontSize: 18 }}>{warningCenterAlerts[0].risk}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Severity</div>
                <div className="status-value" style={{ color: alertColors[warningCenterAlerts[0].severity] || T.accent }}>{warningCenterAlerts[0].severity}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Time detected</div>
                <div className="status-value" style={{ fontSize: 16 }}>{warningCenterAlerts[0].time}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Environment</div>
                <div className="status-value" style={{ fontSize: 16 }}>{environment.temp}°C / AQI {environment.airQuality}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
            {warningCenterAlerts.map((warning) => (
              <div key={`${warning.risk}-${warning.time}`} className="panel" style={{ padding: 18 }}>
                <div className="alert-header" style={{ alignItems: "flex-start" }}>
                  <div>
                    <div className="panel-copy" style={{ marginBottom: 6 }}>Risk detected</div>
                    <h3 style={{ margin: 0 }}>{warning.risk}</h3>
                  </div>
                  <div className="alert-badge" style={{ background: `${alertColors[warning.severity] || T.accent}18`, borderColor: `${alertColors[warning.severity] || T.accent}55`, color: alertColors[warning.severity] || T.accent }}>{warning.severity}</div>
                </div>

                <div className="sms-box" style={{ marginTop: 12 }}>
                  <strong style={{ color: T.text }}>Why it was detected:</strong> {warning.reason}
                </div>

                <div className="sms-box" style={{ marginTop: 12, background: "rgba(78,226,199,0.06)", borderColor: "rgba(78,226,199,0.25)" }}>
                  <strong style={{ color: T.text }}>Recommended action:</strong> {warning.action}
                </div>

                <div className="status-strip" style={{ marginTop: 12 }}>
                  <div className="status-card" style={{ gridColumn: "span 2" }}>
                    <div className="status-label">Time detected</div>
                    <div className="status-value" style={{ fontSize: 16 }}>{warning.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "disaster") {
      const disasterLocationName = deviceLocation.permission === "granted" && deviceLocation.lat !== null && deviceLocation.lng !== null
        ? `${manualLocationCity || "Current Location"}${manualLocationCity && manualLocationState ? `, ${manualLocationState}` : ""}`
        : `${manualLocationCity || "Current Location"}${manualLocationCity && manualLocationState ? `, ${manualLocationState}` : ""}`;

      const disasterDataMode = deviceLocation.permission === "granted" && deviceLocation.lat !== null && deviceLocation.lng !== null
        ? "LIVE DATA"
        : manualLocationCity || manualLocationState
          ? "CACHED DATA"
          : "DEMO DATA";

      const disasterRiskScore = Math.min(100, Math.round(
        environment.airQuality * 0.28 +
        Math.max(0, environment.temp - 26) * 3.6 +
        Math.max(0, environment.humidity - 55) * 0.7 +
        (environment.floodRisk || 0) * 0.7 +
        (environment.extremeHeat || 0) * 0.5 +
        Math.max(0, (environment.windSpeed || 0) - 25) * 1.2 +
        Math.max(0, environment.pollution - 20) * 0.9
      ));

      const disasterRiskBand = disasterRiskScore <= 25 ? "SAFE" : disasterRiskScore <= 50 ? "LOW RISK" : disasterRiskScore <= 75 ? "HIGH RISK" : "CRITICAL";
      const disasterRiskReason =
        disasterRiskScore > 75
          ? "High temperature + high humidity + active heat-wave warning = increased heat-stress and flood-related danger."
          : disasterRiskScore > 50
            ? "Elevated heat and environmental stress are pushing the area closer to dangerous conditions for vulnerable users."
            : disasterRiskScore > 25
              ? "Some local weather stress is present, but conditions remain manageable with caution and active monitoring."
              : "Current conditions are stable and within a relatively safe local range.";

      const disasterWarnings = [
        ...(environment.temp > 35 || environment.extremeHeat > 75 ? [{
          title: "🔥 HEAT WAVE WARNING",
          location: disasterLocationName,
          brief: `${environment.temp}°C temperature with ${environment.humidity}% humidity`,
          severity: "HIGH",
          actions: [
            "Stay hydrated and keep ORS or electrolytes available.",
            "Avoid strenuous outdoor activity during peak heat.",
            "Move to a cool or shaded location if symptoms begin."
          ],
          reason: "Extreme heat and elevated humidity are increasing the risk of heat stress and heat stroke.",
        }] : []),
        ...(environment.floodRisk > 60 ? [{
          title: "🌊 FLASH FLOOD WARNING",
          location: disasterLocationName,
          brief: `${environment.rainfall || 42} mm rainfall detected`,
          severity: "CRITICAL",
          actions: [
            "Move to safer or higher ground immediately.",
            "Avoid flooded roads, drains, and underpasses.",
            "Do not walk or drive through moving water."
          ],
          reason: "Heavy rainfall and flood risk are rising in the current area, which increases the danger of local flooding.",
        }] : []),
        ...(environment.airQuality > 60 ? [{
          title: "🌫️ POOR AQI WARNING",
          location: disasterLocationName,
          brief: `AQI ${environment.airQuality} with poor air quality`,
          severity: "MODERATE",
          actions: [
            "Wear a mask outdoors when air quality is poor.",
            "Limit strenuous activity outside.",
            "Prefer cleaner indoor spaces and keep windows closed when needed."
          ],
          reason: "Poor air quality is elevating respiratory stress and worsening health risk for sensitive groups.",
        }] : []),
        ...(environment.windSpeed > 30 || environment.humidity > 75 ? [{
          title: "⛈️ SEVERE WEATHER ALERT",
          location: disasterLocationName,
          brief: `${environment.windSpeed || 32} km/h wind speed and ${environment.humidity}% humidity`,
          severity: "HIGH",
          actions: [
            "Avoid open roads, trees, and exposed areas during unstable weather.",
            "Keep emergency contacts ready in case travel becomes unsafe.",
            "Follow local official emergency instructions if the warning intensifies."
          ],
          reason: "Strong wind and high humidity are increasing the chance of severe local weather, lighting risk, and disruption.",
        }] : []),
      ].sort((a, b) => ({ CRITICAL: 3, HIGH: 2, MODERATE: 1 }[b.severity] - { CRITICAL: 3, HIGH: 2, MODERATE: 1 }[a.severity]));

      const activeRiskSummary = disasterWarnings.length
        ? disasterWarnings.map((warning) => `${warning.title.replace(/^[^\w]+|\s+WARNING$/g, "")}`)
        : ["No active disaster alert"];

      const allowLocationAccess = () => {
        const secureContext = window.isSecureContext || location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

        if (!navigator || !navigator.geolocation) {
          setDeviceLocation((prev) => ({ ...prev, permission: "unsupported", error: "This browser does not support GPS location access." }));
          setStatusText("This device/browser cannot provide live location. Use manual city entry instead.");
          return;
        }

        if (!secureContext) {
          setDeviceLocation((prev) => ({
            ...prev,
            lat: null,
            lng: null,
            label: "Location unavailable on insecure page",
            permission: "manual",
            error: "Use HTTPS or localhost to enable browser location prompts. You can still use manual city entry here.",
          }));
          setStatusText("The page is not secure. Switch to HTTPS/localhost or use manual city selection for this disaster dashboard.");
          return;
        }

        setStatusText("Requesting your live location for local disaster alerts...");

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDeviceLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              label: "Current device location",
              permission: "granted",
              error: "",
            });
            setDeviceAccess((prev) => ({ ...prev, gps: true }));
            setStatusText("Location access granted. Disaster alerts are now adapting to your live area.");
          },
          (error) => {
            setDeviceLocation((prev) => ({
              ...prev,
              lat: null,
              lng: null,
              label: "Location unavailable",
              permission: "denied",
              error: error.message || "Location access denied. Use manual city selection instead.",
            }));
            setDeviceAccess((prev) => ({ ...prev, gps: false }));
            setStatusText("Location access was denied. Manual city entry is active for disaster monitoring.");
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      };

      return (
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Location-Based Real-Time Disaster Early Warning Dashboard</h2>
              <div className="panel-copy">Local disaster monitoring</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
              <div className="alert-box" style={{ margin: 0 }}>
                <div className="alert-header">
                  <h3>📍 Location</h3>
                  <div className="alert-badge" style={{ background: deviceLocation.permission === "granted" ? "rgba(78,226,199,0.12)" : "rgba(255,191,105,0.12)", borderColor: deviceLocation.permission === "granted" ? "rgba(78,226,199,0.28)" : "rgba(255,191,105,0.26)", color: deviceLocation.permission === "granted" ? T.good : T.warm }}>
                    {deviceLocation.permission === "granted" ? "Active" : "Manual"}
                  </div>
                </div>

                <div className="sms-box" style={{ marginTop: 12 }}>
                  <strong>Allow Rakshak to access your location for local disaster and environmental warnings?</strong>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                  <button type="button" className="primary-btn" onClick={allowLocationAccess}>Allow location access</button>
                  <button type="button" className="secondary-btn" onClick={() => {
                    setDeviceLocation((prev) => ({ ...prev, permission: "manual", label: "Manual location mode", error: "Manual city fallback is active." }));
                    setStatusText("Manual city mode enabled for disaster monitoring.");
                  }}>Use manual city</button>
                </div>

                <div className="status-strip" style={{ marginTop: 12 }}>
                  <div className="status-card" style={{ gridColumn: "span 2" }}>
                    <div className="status-label">Current Location</div>
                    <div className="status-value" style={{ fontSize: 18 }}>{deviceLocation.permission === "granted" ? `${manualLocationCity || "Current Location"}${manualLocationCity && manualLocationState ? `, ${manualLocationState}` : ""}` : `${manualLocationCity || "Current Location"}${manualLocationCity && manualLocationState ? `, ${manualLocationState}` : ""}`}</div>
                  </div>
                  <div className="status-card" style={{ gridColumn: "span 2" }}>
                    <div className="status-label">Location Monitoring</div>
                    <div className="status-value" style={{ fontSize: 18, color: deviceLocation.permission === "granted" ? T.good : T.warm }}>{deviceLocation.permission === "granted" ? "Active" : "Manual fallback"}</div>
                  </div>
                </div>

                {(deviceLocation.permission !== "granted" || !deviceLocation.lat) && (
                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <input
                      placeholder="City"
                      value={manualLocationCity}
                      onChange={(e) => setManualLocationCity(e.target.value)}
                      style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(6,18,26,0.8)", color: T.text, padding: "12px 14px", fontSize: 14 }}
                    />
                    <input
                      placeholder="State"
                      value={manualLocationState}
                      onChange={(e) => setManualLocationState(e.target.value)}
                      style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(6,18,26,0.8)", color: T.text, padding: "12px 14px", fontSize: 14 }}
                    />
                  </div>
                )}
              </div>

              <div className="panel" style={{ padding: 18 }}>
                <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                  <h2>Disaster Risk Score</h2>
                  <div className="panel-copy">0–100 rating</div>
                </div>

                <div className="score-row" style={{ marginTop: 0 }}>
                  <div className="score-value" style={{ fontSize: 56 }}>{disasterRiskScore}</div>
                  <div className="score-badge" style={{ borderColor: disasterRiskScore <= 25 ? "rgba(96,227,154,.5)" : disasterRiskScore <= 50 ? "rgba(255,191,105,.38)" : disasterRiskScore <= 75 ? "rgba(255,155,73,.38)" : "rgba(255,107,107,.45)", color: disasterRiskScore <= 25 ? T.good : disasterRiskScore <= 50 ? T.warm : disasterRiskScore <= 75 ? "#ff9d4d" : T.danger }}>
                    {disasterRiskBand}
                  </div>
                </div>

                <div className="risk-meter" style={{ marginTop: 14 }}>
                  <div className="risk-fill" style={{ width: `${disasterRiskScore}%`, background: disasterRiskScore <= 25 ? "linear-gradient(90deg, #60e39a, #4ee2c7)" : disasterRiskScore <= 50 ? "linear-gradient(90deg, #ffbf69, #f9c74f)" : disasterRiskScore <= 75 ? "linear-gradient(90deg, #ff9d4d, #ff7a59)" : "linear-gradient(90deg, #ff6a6a, #ff4d6d)" }} />
                </div>

                <div className="sms-box" style={{ marginTop: 12 }}>
                  <strong>Why this score:</strong> {disasterRiskReason}
                </div>

                <div className="sms-box" style={{ marginTop: 12, background: "rgba(139,124,246,0.06)", borderColor: "rgba(139,124,246,0.24)" }}>
                  <strong>Linked to anomaly detection:</strong> This disaster risk is evaluated with the same health-environment model used by the Real-Time Anomaly Detection system, so severe heat, AQI stress, and poor weather can trigger higher-risk health alerts together.
                </div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Live Environment Information</h2>
              <div className="panel-copy">Real-time local data</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              {[
                { label: "Temperature", value: `${environment.temp}°C`, color: T.warm },
                { label: "Humidity", value: `${environment.humidity}%`, color: T.accent },
                { label: "Rainfall", value: `${environment.rainfall || 42} mm`, color: T.accent2 },
                { label: "AQI", value: `${environment.airQuality}`, color: T.danger },
                { label: "Wind Speed", value: `${environment.windSpeed || 28} km/h`, color: T.good },
                { label: "Last Updated", value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), color: T.text },
                { label: "Data Status", value: disasterDataMode, color: disasterDataMode === "LIVE DATA" ? T.good : disasterDataMode === "CACHED DATA" ? T.warm : T.accent },
              ].map((metric) => (
                <div key={metric.label} className="mini-card" style={{ background: "rgba(255,255,255,0.025)" }}>
                  <div className="metric-head">
                    <span>{metric.label}</span>
                    <span style={{ color: metric.color }}>●</span>
                  </div>
                  <div className="metric-value" style={{ fontSize: 18 }}>{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Active Risks</h2>
              <div className="panel-copy">Highest priority displayed first</div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {disasterWarnings.length ? disasterWarnings.map((warning) => (
                <div key={warning.title} className="alert-box" style={{ margin: 0, borderColor: warning.severity === "CRITICAL" ? "rgba(255,107,107,0.38)" : warning.severity === "HIGH" ? "rgba(255,191,105,0.38)" : "rgba(78,226,199,0.3)" }}>
                  <div className="alert-header">
                    <h3>{warning.title}</h3>
                    <div className="alert-badge" style={{ background: warning.severity === "CRITICAL" ? "rgba(255,107,107,0.12)" : warning.severity === "HIGH" ? "rgba(255,191,105,0.12)" : "rgba(78,226,199,0.12)", borderColor: warning.severity === "CRITICAL" ? "rgba(255,107,107,0.34)" : warning.severity === "HIGH" ? "rgba(255,191,105,0.34)" : "rgba(78,226,199,0.32)", color: warning.severity === "CRITICAL" ? T.danger : warning.severity === "HIGH" ? T.warm : T.good }}>{warning.severity}</div>
                  </div>

                  <div className="sms-box" style={{ marginTop: 12 }}>
                    <strong>📍 {warning.location}</strong><br />
                    <strong>Weather:</strong> {warning.brief}
                  </div>

                  <div className="sms-box" style={{ marginTop: 12, background: "rgba(255,255,255,0.02)", borderColor: T.borderSoft }}>
                    <strong>Why it was detected:</strong> {warning.reason}
                  </div>

                  <div className="action-list" style={{ margin: "12px 0 0" }}>
                    <div className="panel-copy" style={{ marginBottom: 8 }}>Recommended Actions</div>
                    {warning.actions.map((action) => (
                      <div className="action-item" key={`${warning.title}-${action}`} style={{ marginBottom: 8 }}>
                        <div className="action-icon" style={{ background: "rgba(78,226,199,0.12)", color: T.accent }}><ShieldCheck size={16} /></div>
                        <div>
                          <p style={{ margin: 0 }}>{action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="sms-box">No active disaster warnings for this location at the moment. Continue monitoring local conditions and keep your emergency plans ready.</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "environment") {
      return (
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Current environment dashboard</h2>
              <div className="panel-copy">Live environmental monitoring</div>
            </div>

            <div className="status-strip" style={{ marginTop: 0 }}>
              <div className="status-card">
                <div className="status-label">Current Environment</div>
                <div className="status-value" style={{ fontSize: 18 }}>{environment.temp}°C · {environment.humidity}% RH · AQI {environment.airQuality}</div>
              </div>
              <div className="status-card">
                <div className="status-label">Risk level</div>
                <div className="status-value" style={{ color: environmentRiskScore >= 80 ? T.danger : environmentRiskScore >= 60 ? T.warm : T.accent }}>{environmentRiskLevel}</div>
              </div>
              <div className="status-card" style={{ gridColumn: "span 2" }}>
                <div className="status-label">Recommended action</div>
                <div className="status-value" style={{ fontSize: 15, lineHeight: 1.5 }}>{environmentRecommendedAction}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
            <div className="panel" style={{ padding: 18 }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2>Environmental risk data</h2>
                <div className="panel-copy">Live monitor</div>
              </div>
              <div className="signal-list" style={{ padding: 0 }}>
                {[
                  ["Temperature", environment.temp, `${environment.temp}°C`, "linear-gradient(90deg, #ffbf69, #ff8a5b)"],
                  ["Humidity", environment.humidity, `${environment.humidity}%`, "linear-gradient(90deg, #6ec6ff, #8b7cf6)"],
                  ["Air quality", environment.airQuality, `${environment.airQuality} AQI`, "linear-gradient(90deg, #4ee2c7, #8b7cf6)"],
                  ["Pollution", environment.pollution, `${environment.pollution} µg/m³`, "linear-gradient(90deg, #a5b4fc, #7ad3ff)"],
                  ["Extreme heat", environment.extremeHeat, `${environment.extremeHeat}/100`, "linear-gradient(90deg, #ff7a59, #ff4d6d)"],
                  ["Flood/disaster", environment.floodRisk, `${environment.floodRisk}/100`, "linear-gradient(90deg, #60e39a, #4ee2c7)"],
                ].map(([label, value, metric, color], index) => (
                  <div className="signal-row" key={label} style={{ marginBottom: index < 5 ? 10 : 0 }}>
                    <span className="signal-label">{label}</span>
                    <div className="signal-right">
                      <div className="progress"><span style={{ width: `${Math.min(100, value)}%`, background: color }} /></div>
                      <div className="signal-score">{metric}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{ padding: 18 }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2>Risk alerts & guidance</h2>
                <div className="panel-copy">Action plan</div>
              </div>
              <div className="action-list" style={{ margin: 0 }}>
                {[
                  { title: "Extreme heat", detail: environment.temp > 30 ? "Heat is elevated. Reduce outdoor work, hydrate early, and prioritize cooling and shade." : "Temperature is manageable; keep routine hydration and shade breaks ready.", icon: Thermometer, color: T.warm },
                  { title: "Air quality", detail: environment.airQuality > 45 ? "AQI is elevated. Keep masks ready and reduce strenuous breathing activity outdoors." : "Air quality is within a manageable range for routine movement.", icon: Activity, color: T.accent },
                  { title: "Flood / disaster risk", detail: environment.floodRisk > 25 ? "Flood or storm risk is increasing. Avoid low-lying routes and review emergency drainage paths." : "Flood risk is limited right now, but continue monitoring heavy rain and water accumulation.", icon: ShieldCheck, color: T.accent2 },
                  { title: "Pollution / other risks", detail: environment.pollution > 35 || environment.otherRisks.length ? `Current pollution is ${environment.pollution} µg/m³ and other risks include ${environment.otherRisks.join(", ")}.` : "Pollution and other environmental risks remain low.", icon: Sparkles, color: T.danger },
                ].map(({ title, detail, icon: Icon, color }) => (
                  <div className="action-item" key={title}>
                    <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                    <div>
                      <h4>{title}</h4>
                      <p>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "overall") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Psychological + environmental overview</h2>
              <div className="panel-copy">Combined view</div>
            </div>
            <div className="focus-check" style={{ marginTop: 0 }}>
              <div className="check-item">
                <div className="big" style={{ color: T.accent }}>{current.focus}</div>
                <div className="label">Focus score</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.warm }}>{current.mood}</div>
                <div className="label">Mood state</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.accent2 }}>{current.stress}</div>
                <div className="label">Stress load</div>
              </div>
              <div className="check-item">
                <div className="big" style={{ color: T.good }}>{environmentScore}</div>
                <div className="label">Environment score</div>
              </div>
            </div>
            <div className="insight-box" style={{ margin: "18px 0 0" }}>
              <div className="tag">Integrated summary</div>
              <p>{insight} {environmentSummary}</p>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Overall protective measures</h2>
              <div className="panel-copy">Self-care plan</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {[
                { title: "Pause and recover", detail: "Rest early and reduce screen time if stress climbs above your usual baseline.", icon: MoonStar, color: T.accent },
                { title: "Reset your mental load", detail: "Use a 10-minute breathing reset and reduce over-stimulation before 4 PM.", icon: Brain, color: T.accent2 },
                { title: "Protect against heat", detail: "Hydrate, cool down, and avoid altitude or peak sun exposure during unsafe conditions.", icon: ShieldCheck, color: T.warm },
                { title: "Emergency readiness", detail: "Keep emergency contacts ready and monitor your body for dizziness or sudden worsening symptoms.", icon: HeartPulse, color: T.danger },
              ].map(({ title, detail, icon: Icon, color }) => (
                <div className="action-item" key={title}>
                  <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                  <div>
                    <h4>{title}</h4>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "emergency") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Emergency response</h2>
              <div className="panel-copy">Live guidance</div>
            </div>

            <div className="alert-box" style={{ margin: 0 }}>
              <div className="alert-header">
                <h3>{isDangerState ? "High risk alert" : "Prepared response"}</h3>
                <div className="alert-badge">{isDangerState ? "Monitor" : "Ready"}</div>
              </div>

              <div className="status-strip">
                <div className="status-card">
                  <div className="status-label">Health</div>
                  <div className="status-value">{current.recovery < 70 ? "Elevated" : "Stable"}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Environment</div>
                  <div className="status-value">{environment.temp > 30 || environment.airQuality > 45 ? "Unsafe" : "Safe"}</div>
                </div>
              </div>

              <div className="status-strip" style={{ marginTop: 12 }}>
                <div className="status-card">
                  <div className="status-label">Contacts</div>
                  <div className="status-value" style={{ color: deviceAccess.contacts ? T.good : T.warm }}>{deviceAccess.contacts ? "Synced" : "Waiting"}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">GPS</div>
                  <div className="status-value" style={{ color: deviceAccess.gps ? T.good : T.warm }}>{deviceAccess.gps ? "Live" : "Waiting"}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Wearables</div>
                  <div className="status-value" style={{ color: deviceAccess.wearables ? T.good : T.warm }}>{deviceAccess.wearables ? "Offline Ready" : "Unavailable"}</div>
                </div>
              </div>

              <div className="map-card">
                <iframe
                  title="Emergency location map"
                  className="map-frame"
                  src={emergencyMapUrl}
                  loading="lazy"
                  allowFullScreen
                />
                <div className="map-marker" />
                <div className="map-badge"><ShieldCheck size={10} /> {liveLocation.label}</div>
              </div>

              <div className="alert-actions">
                <button className="action-primary" onClick={dialEmergencyContacts} disabled={!emergencyContacts.length}>Call contacts</button>
                <button className="action-secondary" onClick={sendRiskMessageToAllContacts} disabled={!emergencyContacts.length}>Message all</button>
                <button className="action-secondary" onClick={openMap}>Safe zone</button>
              </div>

              <div className="sms-box" style={{ marginTop: 12 }}>
                {deviceLocation.permission === "granted"
                  ? `Live location access is enabled. Current coordinates: ${deviceLocation.lat?.toFixed(4)}, ${deviceLocation.lng?.toFixed(4)}`
                  : deviceLocation.error || "Location access is required to send the live location in the emergency message."}
              </div>

              <div className="alert-contact-list">
                {emergencyContacts.length ? (
                  emergencyContacts.map((contact) => (
                    <div className="contact-row" key={`${contact.name}-${contact.phone}`}>
                      <div className="contact-meta">
                        <div className="contact-name">{contact.name}</div>
                        <div className="contact-number">{contact.phone}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="call-btn" onClick={() => triggerCall(contact.phone)}>Call</button>
                        <button className="call-btn" style={{ background: "linear-gradient(135deg, #8b7cf6, #a7a0ff)", color: "#fff" }} onClick={() => sendRiskMessageToContact(contact)}>Message</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sms-box">
                    No device contacts are available yet. Use “Connect to device” to select trusted contacts from the connected phone.
                  </div>
                )}
              </div>

              <div className="sms-box">
                {isDangerState
                  ? "Important: the system is automatically contacting priority contacts because the environment or mental health risk is high. Take immediate rest, hydrate, and seek safe shelter if symptoms worsen."
                  : "Your current risk is manageable. Keep hydration and cooling routines ready, and remain alert to sudden spikes in stress, heat, or air conditions."}
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Emergency plan</h2>
              <div className="panel-copy">Quick actions</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {[
                { title: "Move to cool indoor space", detail: "If heat or air stress rises, relocate to a cooler indoor environment and keep fluids ready.", icon: ShieldCheck, color: T.warm },
                { title: "Contact support", detail: "Notify your emergency contact and use your saved access number for direct contact.", icon: HeartPulse, color: T.accent },
                { title: "Monitor warning signs", detail: "Look for dizziness, chest pain, confusion, fainting, or sudden worsening of fatigue.", icon: Activity, color: T.danger },
                { title: "Keep a safe response ready", detail: "Store your location, emergency numbers, and travel route in case you need fast action.", icon: Sparkles, color: T.accent2 },
              ].map(({ title, detail, icon: Icon, color }) => (
                <div className="action-item" key={title}>
                  <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                  <div>
                    <h4>{title}</h4>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
        <div className="panel" style={{ padding: 18 }}>
          <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
            <h2>Heart rate analysis</h2>
            <div className="panel-copy">Risk inspection</div>
          </div>
          <div className="signal-list" style={{ padding: 0 }}>
            {[
              ["Heart rate", current.sleep > 7 ? 78 : 62, `${current.sleep > 7 ? 78 : 62} bpm`, "linear-gradient(90deg, #4ee2c7, #7ee4d0)"],
              ["Recovery", current.recovery, `${current.recovery}/100`, "linear-gradient(90deg, #8b7cf6, #b8aef9)"],
              ["Stress", current.stress, `${current.stress}/100`, "linear-gradient(90deg, #ffbf69, #ffd08a)"],
              ["Focus", current.focus, `${current.focus}/100`, "linear-gradient(90deg, #4ee2c7, #8b7cf6)"],
            ].map(([label, value, metric, color], index) => (
              <div className="signal-row" key={label} style={{ marginBottom: index < 3 ? 10 : 0 }}>
                <span className="signal-label">{label}</span>
                <div className="signal-right">
                  <div className="progress"><span style={{ width: `${Math.min(value, 100)}%`, background: color }} /></div>
                  <div className="signal-score">{metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
            <h2>Health risk recommendations</h2>
            <div className="panel-copy">Measure + guidance</div>
          </div>
          <div className="action-list" style={{ margin: 0 }}>
            {[
              { title: "Protect sleep", detail: current.sleep < 7 ? "Increase sleep by 30 minutes and reduce late-night screens." : "Keep your current sleep rhythm stable to maintain recovery.", icon: MoonStar, color: T.accent },
              { title: "Reduce stress drift", detail: current.stress > 45 ? "Use a 10-minute reset before 4 PM to keep stress from spiking." : "Stress remains manageable; continue current recovery practices.", icon: Zap, color: T.warm },
              { title: "Boost focus", detail: current.focus < 75 ? "Schedule deep work in the first 90 minutes after waking." : "Your focus is above baseline; keep your strongest routine intact.", icon: Brain, color: T.accent2 },
              { title: "Health risk response", detail: current.stress > 45 || current.sleep < 7 || current.recovery < 70 ? "Prioritize rest, hydration, and cautious activity if symptoms worsen." : "You are within a safe trend; keep monitoring for sudden changes.", icon: HeartPulse, color: T.danger },
            ].map(({ title, detail, icon: Icon, color }) => (
              <div className="action-item" key={title}>
                <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                <div>
                  <h4>{title}</h4>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; }
        button, select { font: inherit; }
        .page { max-width: 1200px; width: 100%; margin: 0 auto; padding: 28px 22px 48px; display: flex; flex-direction: column; align-items: center; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 24px; width: 100%; }
        .tab-bar { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 24px; justify-content: center; align-items: center; width: 100%; }
        .tab-btn { border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.textDim}; border-radius: 12px; padding: 10px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
        .tab-btn.active { background: rgba(78, 226, 199, 0.12); color: ${T.text}; border-color: rgba(78, 226, 199, 0.35); }
        .tab-badge { min-width: 22px; height: 22px; padding: 0 7px; border-radius: 999px; background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.32); color: #ffb4b4; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .ai-strip { width: 100%; margin: 0 0 18px; padding: 14px 18px; border-radius: 16px; border: 1px solid rgba(78,226,199,0.3); background: rgba(78,226,199,0.08); display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .ai-strip.warning { border-color: rgba(255,191,105,0.35); background: rgba(255,191,105,0.08); }
        .ai-strip.critical { border-color: rgba(255,107,107,0.38); background: rgba(255,107,107,0.09); }
        .ai-strip-title { font-weight: 700; letter-spacing: -0.04em; }
        .ai-strip-copy { color: ${T.textDim}; font-size: 12px; line-height: 1.5; }
        .ai-strip-badge { padding: 6px 10px; border-radius: 999px; border: 1px solid; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
        .severity-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .legend-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 999px; border: 1px solid ${T.borderSoft}; background: rgba(255,255,255,0.02); font-size: 11px; color: ${T.textDim}; }
        .legend-swatch { width: 10px; height: 10px; border-radius: 50%; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark { width: 38px; height: 38px; border-radius: 12px; background: rgba(78, 226, 199, 0.14); border: 1px solid rgba(78, 226, 199, 0.4); display:flex; align-items:center; justify-content:center; }
        .brand-name { font-size: 24px; font-weight: 700; letter-spacing: -0.04em; }
        .status-pill { border: 1px solid ${T.border}; background: ${T.surface}; border-radius: 999px; padding: 8px 12px; color: ${T.textDim}; font-size: 12px; display: inline-flex; align-items:center; gap:8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: ${T.good}; box-shadow: 0 0 12px ${T.good}; }
        .hero { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 18px; }
        .panel { background: linear-gradient(180deg, rgba(16,45,59,0.96), rgba(10,28,38,0.95)); border: 1px solid ${T.border}; border-radius: 22px; box-shadow: 0 18px 40px ${T.shadow}; }
        .hero-panel { padding: 26px; }
        .eyebrow { display:inline-flex; align-items:center; gap:8px; padding: 8px 12px; border-radius: 999px; background: rgba(139,124,246,0.08); border: 1px solid rgba(139,124,246,0.25); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #d6ccff; }
        h1 { margin: 18px 0 12px; font-size: clamp(2.5rem, 5vw, 4.2rem); line-height: 0.96; letter-spacing: -0.07em; }
        .gradient-text { background: linear-gradient(135deg, #e6f9f6 0%, #62d9c8 30%, #b7ccff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .subtext { color: ${T.textDim}; font-size: 16px; line-height: 1.6; max-width: 640px; }
        .cta-row { display:flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
        .primary-btn, .secondary-btn { border-radius: 12px; padding: 12px 18px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
        .primary-btn { background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; }
        .secondary-btn { background: transparent; border-color: ${T.border}; color: ${T.text}; }
        .score-panel { padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
        .score-label { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${T.textMuted}; }
        .score-row { display: flex; align-items: baseline; gap: 8px; margin-top: 12px; }
        .score-value { font-size: 62px; line-height: 1; letter-spacing: -0.09em; font-weight: 700; }
        .score-badge { font-size: 12px; padding: 5px 9px; border-radius: 999px; border: 1px solid; }
        .mini-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
        .mini-card { padding: 12px 14px; background: ${T.panelAlt}; border: 1px solid ${T.borderSoft}; border-radius: 14px; }
        .metric-head { display:flex; justify-content:space-between; align-items:center; color: ${T.textDim}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
        .metric-value { margin-top: 8px; font-size: 24px; font-weight: 700; }
        .metric-value small { font-size: 12px; color: ${T.textDim}; margin-left: 4px; }
        .card-grid { margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .summary-card { padding: 18px 18px 16px; }
        .summary-icon-wrap { width: 38px; height: 38px; border-radius: 12px; display:flex; align-items:center; justify-content:center; margin-bottom: 16px; }
        .summary-card h3 { margin: 0 0 8px; font-size: 14px; }
        .summary-card p { margin: 0; color: ${T.textDim}; font-size: 12.5px; line-height:1.6; }
        .summary-value { display:flex; justify-content:space-between; align-items:flex-end; margin-top: 12px; }
        .summary-value strong { font-size: 28px; letter-spacing:-0.06em; }
        .summary-value span { color: ${T.textMuted}; font-size: 12px; }
        .risk-meter { position: relative; height: 12px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid ${T.borderSoft}; margin-top: 12px; }
        .risk-fill { position: absolute; inset: 0 auto 0 0; border-radius: inherit; }
        .main-grid { margin-top: 20px; display:grid; grid-template-columns: 1.35fr 0.95fr; gap: 18px; }
        .panel-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 18px 18px 0; }
        .panel-header h2 { margin: 0; font-size: 18px; }
        .panel-copy { color: ${T.textDim}; font-size: 12px; }
        .day-switcher { display:flex; gap: 8px; flex-wrap: wrap; padding: 0 18px 18px; margin-top: 18px; }
        .day-pill { border-radius: 10px; padding: 8px 10px; border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.textDim}; cursor: pointer; }
        .day-pill.active { background: rgba(78, 226, 199, 0.12); border-color: rgba(78, 226, 199, 0.35); color: ${T.text}; }
        .chart-wrap { padding: 0 18px 18px; height: 260px; }
        .insight-box { margin: 18px; padding: 16px; border-radius: 16px; background: rgba(139,124,246,0.08); border: 1px solid rgba(139,124,246,0.25); }
        .insight-box .tag { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #d6ccff; }
        .insight-box p { margin: 10px 0 0; font-size: 14px; line-height: 1.7; color: ${T.text}; }
        .action-list { margin: 18px; display:flex; flex-direction:column; gap: 12px; }
        .action-item { display:flex; gap: 12px; padding: 12px; background: ${T.panelAlt}; border-radius: 14px; border: 1px solid ${T.borderSoft}; }
        .action-icon { width: 38px; height: 38px; border-radius: 12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .action-item h4 { margin: 0 0 5px; font-size: 14px; }
        .action-item p { margin: 0; color: ${T.textDim}; font-size: 12px; line-height:1.55; }
        .bottom-grid { margin-top: 20px; display:grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .signal-list { padding: 0 18px 18px; display:flex; flex-direction:column; gap: 12px; }
        .signal-row { display:flex; align-items:center; justify-content:space-between; gap: 16px; }
        .signal-label { font-size: 13px; color: ${T.textDim}; }
        .signal-right { display:flex; align-items:center; gap: 12px; }
        .progress { width: 150px; height: 8px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow:hidden; border: 1px solid ${T.borderSoft}; }
        .progress > span { display:block; height:100%; border-radius: inherit; }
        .signal-score { font-size: 12px; color: ${T.text}; font-weight:600; }
        .focus-card { padding: 18px; }
        .focus-check { display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 18px; }
        .check-item { background: ${T.panelAlt}; border: 1px solid ${T.borderSoft}; border-radius: 14px; padding: 14px; }
        .check-item .big { font-size: 26px; font-weight: 700; letter-spacing:-0.06em; }
        .check-item .label { color: ${T.textDim}; font-size: 12px; margin-top: 8px; }
        .alert-box { margin: 18px; padding: 16px; border-radius: 16px; border: 1px solid rgba(255, 107, 107, 0.4); background: rgba(255, 107, 107, 0.08); animation: pulse 1.3s infinite; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(255,107,107,0.15); }
          50% { box-shadow: 0 0 24px rgba(255,107,107,0.35); }
        }
        .alert-header { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .alert-header h3 { margin: 0; font-size: 18px; }
        .alert-badge { padding: 6px 10px; border-radius: 999px; background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.32); color: #ffb4b4; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
        .status-strip { margin-top: 14px; display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .status-card { padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid ${T.borderSoft}; }
        .status-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.textMuted}; }
        .status-value { margin-top: 6px; font-size: 18px; font-weight: 700; letter-spacing: -0.04em; }
        .map-card { margin-top: 14px; border-radius: 14px; height: 150px; position: relative; overflow: hidden; border: 1px solid ${T.borderSoft}; background: linear-gradient(135deg, rgba(78,226,199,0.12), rgba(46,91,121,0.1)); }
        .map-card::before { content: ""; position:absolute; inset: 0; background:
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 18px 18px, 18px 18px; }
        .map-frame { position:absolute; inset:0; width:100%; height:100%; border:0; filter: grayscale(0.2) saturate(1.1) contrast(1.05); }
        .map-marker { position:absolute; width: 14px; height:14px; background: ${T.danger}; border-radius:50%; border: 3px solid rgba(255,255,255,0.9); box-shadow: 0 0 0 6px rgba(255,107,107,0.22); left: 62%; top: 42%; z-index:2; }
        .map-badge { position:absolute; right: 10px; bottom: 10px; z-index: 2; display:inline-flex; align-items:center; gap: 6px; border-radius:999px; padding: 6px 10px; background: rgba(7, 27, 42, 0.73); border: 1px solid rgba(255,255,255,0.12); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.text}; }
        .alert-actions { display:flex; gap:10px; margin-top: 14px; }
        .action-primary, .action-secondary { flex:1; border:none; border-radius: 10px; padding: 10px 12px; font-weight:700; cursor:pointer; }
        .action-primary { background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; }
        .action-secondary { background: rgba(255,255,255,0.04); border: 1px solid ${T.borderSoft}; color: ${T.text}; }
        .alert-contact-list { margin-top: 14px; display:flex; flex-direction:column; gap: 10px; }
        .contact-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid ${T.borderSoft}; }
        .contact-meta { display:flex; flex-direction:column; }
        .contact-name { font-size: 13px; font-weight: 600; }
        .contact-number { font-size: 12px; color: ${T.textDim}; }
        .call-btn { border: none; border-radius: 10px; background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; padding: 8px 10px; font-weight: 700; cursor: pointer; }
        .sms-box { margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: rgba(78,226,199,0.08); border: 1px solid rgba(78,226,199,0.24); color: ${T.textDim}; font-size: 12px; line-height:1.6; }
        .recent-dials { margin-top: 14px; display:flex; flex-direction:column; gap: 8px; }
        .dial-item { display:flex; justify-content:space-between; align-items:center; padding: 9px 10px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid ${T.borderSoft}; }
        .dial-item small { color: ${T.textDim}; }
        @media (max-width: 900px) {
          .hero, .main-grid, .bottom-grid, .card-grid { grid-template-columns: 1fr; }
          .topbar { flex-direction: column; align-items: flex-start; }
          .score-value { font-size: 52px; }
        }

        @media (max-width: 680px) {
          .page { padding: 16px 12px 28px; }
          .topbar { margin-bottom: 16px; }
          .brand-name { font-size: 20px; }
          .status-pill { width: 100%; justify-content: center; }
          .tab-bar { gap: 8px; }
          .tab-btn { flex: 1 1 calc(50% - 8px); justify-content: center; padding: 9px 10px; font-size: 11px; }
          .hero-panel, .score-panel { padding: 18px 16px; }
          .score-panel { gap: 10px; }
          .score-value { font-size: 42px; }
          .mini-grid, .focus-check, .status-strip { grid-template-columns: 1fr; }
          .cta-row { flex-direction: column; }
          .primary-btn, .secondary-btn, .action-primary, .action-secondary { width: 100%; }
          .summary-card, .action-item { padding: 12px; }
          .action-list, .signal-list, .alert-box, .insight-box { margin-left: 10px; margin-right: 10px; }
          .alert-actions { flex-direction: column; }
          .contact-row { flex-direction: column; align-items: flex-start; }
          .call-btn { width: 100%; }
          .progress { width: 90px; }
          .map-card { height: 120px; }
          .signal-row { align-items: flex-start; flex-direction: column; }
          .signal-right { width: 100%; }
        }
      `}</style>

      <div className="page">
        {showContactPicker && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(3, 12, 18, 0.76)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 40 }}>
            <div className="panel" style={{ width: "min(560px, 100%)", padding: 22 }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Emergency contacts</h2>
                <div className="panel-copy">Local-only, privacy-aware contact setup</div>
              </div>

              {phoneConnectMode === "choose" && (
                <>
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: `1px solid ${T.borderSoft}`, background: "rgba(78,226,199,0.06)", color: T.textDim, fontSize: 13, lineHeight: 1.6 }}>
                    {recentCallPermissionMessage}
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                    <button className="primary-btn" onClick={requestContactPicker}>Allow access to device contacts</button>
                    <button className="secondary-btn" onClick={requestRecentCallHistoryAccess}>Use recent call history</button>
                    <button className="secondary-btn" onClick={() => setPhoneConnectMode("manual")}>Add emergency contacts manually</button>
                    <button className="secondary-btn" onClick={handleOpenCompanionApp}>Open companion app</button>
                  </div>

                  <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, color: T.textDim, lineHeight: 1.6 }}>
                    If this browser or device cannot access your recent call logs, Rakshak will not generate fake contacts. You can add trusted people manually instead.
                  </div>

                  <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(139,124,246,0.08)", border: `1px solid rgba(139,124,246,0.25)`, color: T.textDim, lineHeight: 1.6, fontSize: 12.5 }}>
                    <strong style={{ color: T.text }}>Enable access in device settings:</strong>
                    <br />Android: Settings → Apps → Browser/Chrome → Permissions → Contacts/Phone → Allow
                    <br />iPhone: Settings → Safari/Browser → Permissions → Contacts → Allow
                    <br />After enabling, return to Rakshak and tap “Allow access to device contacts” again.
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                    <button className="secondary-btn" onClick={() => setShowContactPicker(false)}>Cancel</button>
                  </div>
                </>
              )}

              {phoneConnectMode === "review" && (
                <>
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: `1px solid ${T.borderSoft}`, background: "rgba(78,226,199,0.06)", color: T.textDim, fontSize: 13, lineHeight: 1.6 }}>
                    Review these 5 local recent call numbers before using them for SOS calls or emergency messages.
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    {recentCallCandidates.map((contact, index) => (
                      <div key={`${contact.name}-${contact.phone}-${index}`} style={{ padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, color: T.text }}>
                        <div style={{ fontWeight: 600 }}>{contact.name}</div>
                        <div style={{ color: T.textDim, fontSize: 12, marginTop: 2 }}>{contact.phone}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                    <button className="secondary-btn" onClick={() => setPhoneConnectMode("choose")}>Back</button>
                    <button className="primary-btn" onClick={() => { applyEmergencyContacts(recentCallCandidates); setShowContactPicker(false); }}>Use these contacts</button>
                  </div>
                </>
              )}

              {phoneConnectMode === "manual" && (
                <>
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: `1px solid ${T.borderSoft}`, background: "rgba(78,226,199,0.06)", color: T.textDim, fontSize: 13, lineHeight: 1.6 }}>
                    Add a trusted emergency contact manually. This is the safe fallback when recent-call access is unavailable or denied.
                  </div>

                  <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 8, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>
                      Contact name
                      <input
                        value={manualContactName}
                        onChange={(e) => setManualContactName(e.target.value)}
                        placeholder="Name"
                        style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(6,18,26,0.8)", color: T.text, padding: "12px 14px", fontSize: 14 }}
                      />
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 8, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>
                      Phone number
                      <input
                        value={manualContactPhone}
                        onChange={(e) => setManualContactPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(6,18,26,0.8)", color: T.text, padding: "12px 14px", fontSize: 14 }}
                      />
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                    <button className="secondary-btn" onClick={() => setPhoneConnectMode("choose")}>Back</button>
                    <button className="primary-btn" onClick={saveManualEmergencyContact}>Save contact</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><ShieldCheck size={18} color={T.accent} /></div>
            <div className="brand-name">Rakshak</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="status-pill"><span className="dot" /> {statusText}</div>
            <button className="secondary-btn" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="tab-bar">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            const warningCount = tab.id === "warnings" ? warningCenterAlerts.filter((item) => item.severity !== "Normal").length : 0;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
                {warningCount > 0 && <span className="tab-badge">{warningCount}</span>}
              </button>
            );
          })}
        </div>

        <div className={`ai-strip ${assistantPriorityBanner.tone === "critical" ? "critical" : assistantPriorityBanner.tone === "high" ? "warning" : ""}`}>
          <div>
            <div className="ai-strip-title">{assistantPriorityBanner.title}</div>
            <div className="ai-strip-copy">{assistantPriorityBanner.detail}</div>
          </div>
          <div
            className="ai-strip-badge"
            style={{
              background: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.12)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.12)" : "rgba(78,226,199,0.12)",
              borderColor: assistantPriorityBanner.tone === "critical" ? "rgba(255,107,107,0.34)" : assistantPriorityBanner.tone === "high" ? "rgba(255,191,105,0.34)" : "rgba(78,226,199,0.28)",
              color: assistantPriorityBanner.tone === "critical" ? T.danger : assistantPriorityBanner.tone === "high" ? T.warm : T.good,
            }}
          >
            {assistantPriorityBanner.tone === "critical" ? "Urgent" : assistantPriorityBanner.tone === "high" ? "Act now" : "Monitor"}
          </div>
        </div>

        <section className="hero">
          <div className="panel hero-panel">
            <div className="eyebrow"><Sparkles size={12} /> {overviewConfig[activeTab].header}</div>
            <h1>
              {activeTab === "ai" && <>Your on-device AI health monitor is <span className="gradient-text">watching your signals</span></>}
              {activeTab === "anomaly" && <>Real-time health alerts are <span className="gradient-text">tracking your drift</span></>}
              {activeTab === "warnings" && <>Your early warning center is <span className="gradient-text">detecting risk before it escalates</span></>}
              {activeTab === "disaster" && <>Weather danger is <span className="gradient-text">being detected live</span></>}
              {activeTab === "environment" && <>Your environment is <span className="gradient-text">under watch</span></>}
              {activeTab === "overall" && <>Your mental and environmental balance is <span className="gradient-text">being monitored</span></>}
              {activeTab === "emergency" && <>Your safety response is <span className="gradient-text">ready to act</span></>}
            </h1>
            <div className="subtext">
              {activeTab === "ai" && "Local AI reads your health signals on the device to track heart rate, oxygen, respiration, stress, and recovery without uploading sensitive data to the cloud."}
              {activeTab === "anomaly" && "Monitor sudden recovery drops, sleep drift, stress spikes, and heat-related anomalies before they turn into a health event."}
              {activeTab === "warnings" && "Early Warning Center scans your health and environment together to flag potential risk before it becomes an emergency, with clear guidance and timing."}
              {activeTab === "disaster" && "This mode reads the current weather conditions and highlights the danger level so you can act early during heat, air-quality, or UV-heavy conditions."}
              {activeTab === "environment" && "Monitor air quality, heat, humidity, and UV levels to protect your body and daily routine when outdoor conditions worsen."}
              {activeTab === "overall" && "Review your focus, mood, stress, and environment together to understand how your psychological state and conditions work as one system."}
              {activeTab === "emergency" && "Fast response guidance, emergency contacts, and live alerts keep you prepared when health or environmental danger rises."}
            </div>
            <div className="cta-row">
              <button className="primary-btn" onClick={handleTodayStatus}>View today</button>
              <button className="secondary-btn" onClick={handleAdjustGoals}>Adjust goals</button>
            </div>
          </div>

          <div className="panel score-panel">
            <div>
              <div className="score-label">
                {activeTab === "anomaly" ? "Anomaly risk" : activeTab === "warnings" ? "Early warning score" : activeTab === "disaster" ? "Weather danger" : activeTab === "environment" ? "Environment score" : activeTab === "emergency" ? "Emergency readiness" : "Integrated score"}
              </div>
              <div className="score-row">
                <div className="score-value">{overviewConfig[activeTab].score}</div>
                <div className="score-badge" style={{ borderColor: overviewConfig[activeTab].badgeColor === T.good ? "rgba(96,227,154,.5)" : overviewConfig[activeTab].badgeColor === T.accent ? "rgba(78,226,199,.4)" : "rgba(255,191,105,.38)", color: overviewConfig[activeTab].badgeColor }}>
                  {overviewConfig[activeTab].scoreLabel}
                </div>
              </div>
            </div>

            <div className="mini-grid">
              {overviewConfig[activeTab].metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div className="mini-card" key={metric.label}>
                    <div className="metric-head">
                      <span>{metric.label}</span>
                      <Icon size={12} color={metric.color} />
                    </div>
                    <div className="metric-value">{metric.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="card-grid">
          {overviewConfig[activeTab].cards.map((card) => (
            <div className="panel summary-card" key={card.title}>
              <div className="summary-icon-wrap" style={{ background: card.color }}>
                <card.icon size={18} color={card.title.includes("Environment") ? T.good : card.title.includes("Mood") ? T.warm : T.accent2} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
              <div className="summary-value">
                <strong>{card.value}</strong>
                <span>{card.meta}</span>
              </div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 20, width: "100%", display: "flex", justifyContent: "center" }}>{renderTabContent()}</section>
      </div>
    </div>
  );
}
