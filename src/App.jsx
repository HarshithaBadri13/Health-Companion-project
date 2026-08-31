import React, { useEffect, useMemo, useRef, useState } from "react";
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
  bg: "#05070D",
  surface: "#0A111C",
  panel: "rgba(15, 23, 35, 0.9)",
  panelAlt: "rgba(10, 17, 28, 0.9)",
  border: "rgba(0, 217, 255, 0.18)",
  borderSoft: "rgba(0, 245, 212, 0.12)",
  text: "#F3FBFF",
  textDim: "#CFEAFB",
  textMuted: "#8CAEC9",
  accent: "#00D9FF",
  accent2: "#00F5D4",
  warm: "#8AE8FF",
  good: "#3AE5B7",
  danger: "#FF5C7A",
  shadow: "rgba(0, 217, 255, 0.12)",
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

const demoContacts = [
  { id: "maya", name: "Maya Patel", phone: "+91 98765 43210" },
  { id: "arjun", name: "Arjun Shah", phone: "+91 90000 11122" },
  { id: "leah", name: "Leah Brown", phone: "+1 415 555 0180" },
  { id: "samir", name: "Samir Khan", phone: "+91 98200 55011" },
];

const average = (key) => history.reduce((sum, item) => sum + item[key], 0) / history.length;

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

function getWeatherConditionLabel(code) {
  const map = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Foggy",
    48: "Dense fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
  };

  return map[code] || "Variable conditions";
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

function LogoMark({ size = 18, color = "#4ee2c7" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rakshak logo"
    >
      <defs>
        <linearGradient id="rakshak-logo-gradient" x1="10" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} />
          <stop offset="1" stopColor="#8b7cf6" />
        </linearGradient>
      </defs>
      <path d="M32 6L50 12V28C50 39.4 42.1 48.6 32 55C21.9 48.6 14 39.4 14 28V12L32 6Z" fill="url(#rakshak-logo-gradient)" opacity="0.18" />
      <path d="M32 6L50 12V28C50 39.4 42.1 48.6 32 55C21.9 48.6 14 39.4 14 28V12L32 6Z" stroke="url(#rakshak-logo-gradient)" strokeWidth="3.2" />
      <path d="M23 31C24.6 26.6 28 23 32 23C36.2 23 39.7 26.4 41.2 31.1L42.5 34.8C43.9 39.6 40.9 44.8 35.9 46.2L34.3 46.6C29.1 47.8 23.7 44.5 22.2 39.5L21.2 35.6C20.8 34.1 21.1 32.4 22.2 31.3L23 31Z" fill="url(#rakshak-logo-gradient)" opacity="0.9" />
      <path d="M32 18V29M26 23L32 29L38 23" stroke="#EAF7F8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [authMode, setAuthMode] = useState("login");
  const [profile, setProfile] = useState(defaultProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const goToDashboard = () => {
    setIsAuthenticated(true);
    setScreen("dashboard");
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

  if (screen === "splash") {
    return <SplashScreen onStart={() => setScreen("landing")} onLogin={() => { setAuthMode("login"); setScreen("auth"); }} />;
  }

  if (screen === "landing") {
    return <LandingPage onStart={() => setScreen("auth")} onLogin={() => { setAuthMode("login"); setScreen("auth"); }} />;
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

function SplashScreen({ onStart, onLogin }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "radial-gradient(circle at top, rgba(0, 217, 255, 0.18), transparent 30%), linear-gradient(180deg, #05070D 0%, #0A111C 62%, #05070D 100%)",
      color: T.text,
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 20% 20%, rgba(0, 217, 255, 0.12), transparent 30%), radial-gradient(circle at 80% 18%, rgba(0, 245, 212, 0.08), transparent 24%), linear-gradient(90deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 100% 100%, 22px 22px, 22px 22px",
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}>
          <div style={{
            width: 136,
            height: 136,
            borderRadius: 36,
            background: "rgba(10, 17, 28, 0.72)",
            border: "1px solid rgba(0, 217, 255, 0.32)",
            boxShadow: "0 0 0 1px rgba(0, 217, 255, 0.08), 0 15px 50px rgba(0, 217, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <LogoMark size={86} color={T.accent} />
          </div>

          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em", color: T.text, textTransform: "uppercase" }}>Rakshak</span>
        </div>

        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80"
          alt="Health companion concept image"
          style={{
            width: "min(420px, 76vw)",
            height: "auto",
            display: "block",
            borderRadius: 24,
            border: "1px solid rgba(0, 217, 255, 0.22)",
            boxShadow: "0 0 30px rgba(0, 217, 255, 0.12)",
            objectFit: "cover",
          }}
        />

        <button
          onClick={onStart}
          style={{
            border: "1px solid rgba(0, 217, 255, 0.4)",
            borderRadius: 999,
            background: "linear-gradient(135deg, rgba(0, 217, 255, 0.95), rgba(0, 245, 212, 0.9))",
            color: "#04151B",
            padding: "18px 34px",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 18px rgba(0, 217, 255, 0.28)",
            minWidth: 220,
            transition: "all 0.2s ease",
          }}
        >
          Get started
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; font-family: 'Poppins', 'Segoe UI', sans-serif; }
        a { color: inherit; text-decoration: none; }
      `}</style>
    </div>
  );
}

function LandingPage({ onStart, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(0, 217, 255, 0.12), transparent 22%), linear-gradient(180deg, #05070D 0%, #0A111C 55%, #05070D 100%)", color: T.text, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        html { font-size: 16px; }
        body { margin: 0; background: ${T.bg}; font-family: 'Poppins', 'Segoe UI', sans-serif; }
        a { color: inherit; text-decoration: none; }
        .landing-shell { max-width: 1220px; margin: 0 auto; padding: 32px 22px 56px; }
        .landing-shell::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80');
          background-size: cover;
          background-position: center;
          opacity: 0.08;
          pointer-events: none;
        }
        .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark { width: 40px; height: 40px; border-radius: 14px; background: linear-gradient(135deg, rgba(22,181,166,0.12), rgba(79,110,247,0.12)); border: 1px solid rgba(22,181,166,0.25); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7); }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .ghost-btn, .primary-btn { border-radius: 12px; padding: 12px 18px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
        .ghost-btn { background: rgba(15, 23, 35, 0.8); border-color: ${T.border}; color: ${T.text}; }
        .primary-btn { background: linear-gradient(135deg, ${T.accent}, #74d8c7); color: #0a2f3c; box-shadow: 0 10px 20px rgba(22,181,166,0.18); }
        .hero { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: center; }
        .hero-panel { padding: 34px; border-radius: 28px; border: 1px solid ${T.border}; background: linear-gradient(135deg, rgba(12, 22, 32, 0.96), rgba(8, 18, 27, 0.96)); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28); position: relative; overflow: hidden; }
        .hero-panel::before { content: ""; position: absolute; inset: -30% 30% auto auto; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(0, 217, 255, 0.15), transparent 68%); }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; color: ${T.accent2}; letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 12px; border-radius: 999px; background: rgba(79,110,247,0.08); border: 1px solid rgba(79,110,247,0.18); }
        h1 { margin: 18px 0 16px; font-size: clamp(2.8rem, 6vw, 5rem); line-height: 0.96; letter-spacing: -0.08em; }
        .gradient-text { background: linear-gradient(135deg, #dffeff 0%, #62d9c8 35%, #b7ccff 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .landing-copy { max-width: 620px; color: ${T.textDim}; font-size: 17px; line-height: 1.7; }
        .cta-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
        .mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 26px; }
        .mini-stat { padding: 14px 16px; border: 1px solid ${T.border}; background: rgba(12, 22, 32, 0.9); border-radius: 16px; }
        .mini-stat .num { font-size: 26px; font-weight: 700; letter-spacing: -0.06em; }
        .mini-stat .label { color: ${T.textDim}; font-size: 12px; }
        .feature-panel { padding: 24px; border-radius: 28px; border: 1px solid ${T.border}; background: rgba(11, 20, 29, 0.84); }
        .feature-card { padding: 18px; border-radius: 18px; border: 1px solid ${T.borderSoft}; background: rgba(255,255,255,0.02); margin-bottom: 14px; }
        .feature-card:last-child { margin-bottom: 0; }
        .feature-card h3 { font-size: 18px; margin: 12px 0 8px; }
        .feature-card p { margin: 0; color: ${T.textDim}; line-height: 1.6; font-size: 14px; }
        .feature-row { display: flex; align-items: center; gap: 10px; }
        .visual-card { padding: 18px; border-radius: 24px; border: 1px solid ${T.border}; background: linear-gradient(180deg, rgba(14, 24, 34, 0.96), rgba(7, 16, 25, 0.96)); box-shadow: 0 24px 50px rgba(0, 0, 0, 0.20); }
        .visual-top { display:flex; justify-content:space-between; align-items:center; margin-bottom: 18px; }
        .visual-pill { display:inline-flex; align-items:center; gap:8px; padding: 7px 10px; border-radius: 999px; background: rgba(78,226,199,0.09); border: 1px solid rgba(78,226,199,0.25); color: ${T.accent}; font-size: 12px; }
        .mini-visual-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .mini-panel { background: rgba(255,255,255,0.03); border: 1px solid ${T.borderSoft}; border-radius: 16px; padding: 12px; }
        .mini-panel h4 { margin: 0 0 10px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.textMuted}; }
        .mini-panel .big { font-size: 28px; font-weight: 700; letter-spacing: -0.06em; }
        .mini-panel .sub { color: ${T.textDim}; font-size: 12px; margin-top: 6px; }
        .visual-chart { height: 110px; margin-top: 14px; border-radius: 14px; background: linear-gradient(180deg, rgba(78,226,199,0.12), rgba(139,124,246,0.06)); border: 1px solid ${T.borderSoft}; position: relative; overflow: hidden; }
        .visual-chart::before { content: ""; position:absolute; inset: 12% 8% 16% 8%; background: linear-gradient(180deg, rgba(78,226,199,0), rgba(78,226,199,0.5)); clip-path: polygon(0% 100%, 16% 64%, 30% 70%, 44% 50%, 56% 58%, 74% 26%, 100% 18%, 100% 100%); }
        .visual-chart::after { content: ""; position:absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, transparent 40%, rgba(255,255,255,0.06) 60%, transparent 80%); }
        .benefits { margin-top: 28px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .benefit { padding: 24px 18px; border-radius: 20px; border: 1px solid ${T.border}; background: rgba(12, 22, 32, 0.9); }
        .benefit h4 { margin: 12px 0 8px; font-size: 20px; }
        .benefit p { margin: 0; color: ${T.textDim}; font-size: 14px; line-height: 1.6; }
        .journey { margin-top: 30px; padding: 28px 24px; border-radius: 24px; border: 1px solid ${T.border}; background: linear-gradient(180deg, rgba(12, 22, 32, 0.98), rgba(8, 16, 25, 0.96)); }
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
            <div className="brand-mark"><LogoMark size={18} color={T.accent} /></div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em" }}>Rakshak</div>
          </div>
          <div className="nav-actions">
            <button className="ghost-btn" onClick={onLogin}>Login</button>
            <button className="primary-btn" onClick={onStart}>Get started</button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-panel">
            <div className="eyebrow"><Sparkles size={12} /> Privacy-first health intelligence</div>
            <h1>Stay protected. <span className="gradient-text">Act earlier.</span></h1>
            <div className="landing-copy">
              Personal Health Companion uses on-device AI to continuously monitor physiological and environmental signals, detect anomalies in real time, and issue early warnings for extreme weather, health risks, and dangerous changes in your condition — all without sending your data to the cloud.
            </div>
            <div className="cta-group">
              <button className="primary-btn" onClick={onStart}>Create account <ArrowRight size={16} /></button>
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(0, 217, 255, 0.14), transparent 26%), linear-gradient(180deg, #05070D 0%, #0A111C 56%, #05070D 100%)", color: T.text, fontFamily: "'Poppins', 'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        html { font-size: 16px; }
        body {
          margin: 0;
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        h1, h2, h3, h4, h5, h6, strong, b { letter-spacing: -0.04em; }
        button, input, select, textarea { letter-spacing: 0.01em; }
        .auth-box { width: min(980px, 100%); background: linear-gradient(180deg, rgba(16,45,59,0.98), rgba(10,28,38,0.95)); border: 1px solid ${T.border}; border-radius: 30px; box-shadow: 0 28px 70px rgba(0,0,0,0.30); overflow: hidden; }
        .auth-top { padding: 22px 28px; border-bottom: 1px solid ${T.border}; display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); }
        .switch { display:flex; gap: 8px; background: ${T.surface}; padding: 6px; border-radius: 14px; border: 1px solid ${T.border}; }
        .toggle { border: none; background: transparent; color: ${T.textDim}; padding: 10px 16px; border-radius: 11px; cursor: pointer; font-weight: 700; }
        .toggle.active { background: rgba(78,226,199,0.12); color: ${T.text}; border: 1px solid rgba(78,226,199,0.35); }
        .auth-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; }
        .info-panel { padding: 28px; background: linear-gradient(180deg, rgba(78,226,199,0.08), rgba(139,124,246,0.04)); border-right: 1px solid ${T.border}; }
        .info-panel h2 { margin: 18px 0 12px; font-size: 34px; letter-spacing: -0.05em; }
        .info-panel p { margin: 0; line-height: 1.7; color: ${T.textDim}; }
        .info-list { margin-top: 22px; display:grid; gap: 12px; }
        .list-item { display:flex; align-items:flex-start; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 1px solid ${T.border}; border-radius: 14px; color: ${T.textDim}; }
        .form-panel { padding: 28px; background: rgba(255,255,255,0.01); }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        label { display: flex; flex-direction: column; gap: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: ${T.textMuted}; }
        input, select, textarea { width: 100%; border-radius: 14px; border: 1px solid ${T.border}; background: rgba(6,18,26,0.8); color: ${T.text}; padding: 12px 14px; font-size: 14px; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: rgba(78,226,199,0.45); box-shadow: 0 0 0 3px rgba(78,226,199,0.08); }
        input::placeholder, textarea::placeholder { color: ${T.textMuted}; }
        .span-2 { grid-column: span 2; }
        .checkbox-row { display:flex; align-items:flex-start; gap: 10px; color: ${T.textDim}; font-size: 13px; margin-top: 8px; }
        .checkbox-row input { width: 18px; height: 18px; accent-color: ${T.accent}; }
        .submit-btn { margin-top: 18px; width: 100%; padding: 15px 18px; border: none; border-radius: 14px; background: linear-gradient(135deg, ${T.accent}, #7ee4d0); color: #062b2a; font-weight: 800; cursor: pointer; box-shadow: 0 14px 30px rgba(78,226,199,0.20); }
        @media (max-width: 760px) {
          .auth-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
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
  const [activeTab, setActiveTab] = useState("health");
  const [deviceLocation, setDeviceLocation] = useState({
    lat: null,
    lng: null,
    label: "Checking device location...",
    permission: "prompt",
    error: "",
  });
  const [emergencyContacts, setEmergencyContacts] = useState(demoContacts.slice(0, 4));
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState(demoContacts.map((contact) => contact.id));
  const [phoneConnectMode, setPhoneConnectMode] = useState("choose");
  const [enteredPairingCode, setEnteredPairingCode] = useState("");
  const [deviceAccess, setDeviceAccess] = useState({
    contacts: false,
    gps: false,
    wearables: false,
  });
  const [liveWeather, setLiveWeather] = useState({
    temp: 31,
    humidity: 68,
    uvIndex: 7,
    airQuality: 42,
    precipitation: 0,
    windSpeed: 12,
    weatherCode: 0,
    summary: "Checking live weather...",
    alert: "Live weather is being updated.",
    isLoading: true,
  });
  const audioContextRef = useRef(null);

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

  const environment = {
    airQuality: liveWeather.airQuality,
    temp: liveWeather.temp,
    humidity: liveWeather.humidity,
    uvIndex: liveWeather.uvIndex,
    pollen: 58,
    precipitation: liveWeather.precipitation,
    windSpeed: liveWeather.windSpeed,
    weatherCode: liveWeather.weatherCode,
    summary: liveWeather.summary,
    alert: liveWeather.alert,
  };

  const isHealthDanger = current.stress > 45 || current.recovery < 70;
  const isEnvironmentDanger = environment.temp > 30 || environment.airQuality > 45 || environment.uvIndex > 6;
  const isDangerState = isHealthDanger || isEnvironmentDanger;

  const applyEmergencyContacts = (contacts) => {
    const mappedContacts = contacts
      .map((contact) => ({
        name: contact.name || "Emergency contact",
        phone: contact.phone || "",
      }))
      .filter((contact) => contact.phone.replace(/\D/g, ""));

    setEmergencyContacts(mappedContacts.slice(0, 5));
    setStatusText(mappedContacts.length ? "Device contacts connected" : "No valid contacts found");
    return mappedContacts;
  };

  const connectToDeviceContacts = async () => {
    if (!("contacts" in navigator) || !navigator.contacts?.select) {
      setShowContactPicker(true);
      setStatusText("Select emergency contacts");
      return;
    }

    try {
      const selected = await navigator.contacts.select(["name", "tel"], { multiple: true });
      const mappedContacts = selected
        .map((contact) => {
          const phone = contact.tel?.[0]?.value || "";
          const name = contact.name?.[0] || contact.name || "Emergency contact";
          return { name, phone };
        })
        .filter((contact) => contact.phone.trim());

      applyEmergencyContacts(mappedContacts);
    } catch (error) {
      setShowContactPicker(true);
      setStatusText("Contact access denied. Select a fallback contact list.");
    }
  };

  const handleContactPickerSubmit = () => {
    const chosenContacts = demoContacts.filter((contact) => selectedContactIds.includes(contact.id));
    setShowContactPicker(false);
    setPhoneConnectMode("choose");
    setEnteredPairingCode("");
    applyEmergencyContacts(chosenContacts.length ? chosenContacts : demoContacts.slice(0, 4));
    setStatusText(chosenContacts.length ? "Fallback contacts selected" : "Using saved emergency contacts");
  };

  const requestConnectedDeviceAccess = async () => {
    let contactsGranted = false;
    let gpsGranted = false;

    if ("contacts" in navigator && navigator.contacts?.select) {
      try {
        const selected = await navigator.contacts.select(["name", "tel"], { multiple: true });
        const mappedContacts = selected
          .map((contact) => {
            const phone = contact.tel?.[0]?.value || "";
            const name = contact.name?.[0] || contact.name || "Emergency contact";
            return { name, phone };
          })
          .filter((contact) => contact.phone.trim());

        if (mappedContacts.length) {
          applyEmergencyContacts(mappedContacts);
          contactsGranted = true;
        }
      } catch (error) {
        console.warn("Contact access could not be granted automatically", error);
      }
    }

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            gpsGranted = true;
            setDeviceLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              label: "Current device location",
              permission: "granted",
              error: "",
            });
            resolve();
          },
          (error) => {
            console.warn("GPS access denied during automatic sync", error);
            resolve();
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          }
        );
      });
    }

    setDeviceAccess({
      contacts: contactsGranted || emergencyContacts.length > 0,
      gps: gpsGranted || deviceLocation.lat !== null,
      wearables: true,
    });
    setShowContactPicker(false);
    setPhoneConnectMode("choose");
    setStatusText(
      contactsGranted || gpsGranted
        ? "Automatic access granted: contacts, GPS, and offline wearable sensors are ready."
        : "Connected device access is available when permissions are granted on the phone or browser."
    );
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

  const finishPhoneSync = () => {
    const normalizedCode = enteredPairingCode.trim().toUpperCase();

    if (phoneConnectMode === "pair" && normalizedCode && normalizedCode !== pairingCode) {
      setStatusText("Pairing code did not match");
      return;
    }

    const accessSummary = {
      contacts: emergencyContacts.length > 0,
      gps: deviceLocation.lat !== null,
      wearables: true,
    };

    applyEmergencyContacts(demoContacts.slice(0, 4));
    setDeviceAccess(accessSummary);
    setShowContactPicker(false);
    setPhoneConnectMode("choose");
    setEnteredPairingCode("");
    setStatusText("Phone connected successfully. Saved contacts are now available in the emergency view.");
  };

  const toggleSelectedContact = (contactId) => {
    setSelectedContactIds((currentIds) =>
      currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId]
    );
  };

  const openMap = () => {
    window.open(liveLocation.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const openWeatherMap = () => {
    const lat = deviceLocation.lat ?? 19.0760;
    const lng = deviceLocation.lng ?? 72.8777;
    const weatherUrl = `https://www.windy.com/?lat=${lat}&lon=${lng}&zoom=7&layer=radar&menu=rain&detail=detail&detailLat=${lat}&detailLon=${lng}&metricWind=km%2Fh&metricTemp=%C2%B0C&detailShow=true`;
    window.open(weatherUrl, "_blank", "noopener,noreferrer");
  };

  const unlockAudio = async () => {
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioConstructor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn("Audio resume failed:", error);
      }
    }
  };

  const triggerRiskTone = async (riskType = "combined") => {
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioConstructor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioConstructor();
    }

    try {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.warn("Audio context could not resume:", error);
      return;
    }

    const toneMap = {
      health: { frequency: 220, duration: 0.22, type: "sawtooth", volume: 0.045 },
      environment: { frequency: 440, duration: 0.18, type: "triangle", volume: 0.04 },
      combined: { frequency: 310, duration: 0.3, type: "square", volume: 0.055 },
    };

    const tone = toneMap[riskType] || toneMap.combined;

    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = tone.type;
      oscillator.frequency.value = tone.frequency;

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(tone.volume, audioContext.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + tone.duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + tone.duration);
    } catch (error) {
      console.warn("Risk tone could not be started:", error);
    }
  };

  const triggerCall = (number) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned) {
      window.location.href = `tel:${cleaned}`;
    }
  };

  const dialEmergencyContacts = () => {
    if (!emergencyContacts.length) return;

    emergencyContacts.forEach((contact, index) => {
      const cleaned = contact.phone.replace(/\D/g, "");
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
    if (!emergencyContacts.length) return;

    emergencyContacts.forEach((contact, index) => {
      setTimeout(() => sendRiskMessageToContact(contact), index * 250);
    });
  };

  useEffect(() => {
    if (!("contacts" in navigator) || !navigator.contacts?.select) {
      applyEmergencyContacts(demoContacts.slice(0, 4));
      setDeviceAccess((prev) => ({ ...prev, contacts: false }));
      setStatusText("Using saved emergency contacts for the active response view.");
      return;
    }

    connectToDeviceContacts();
  }, []);

  useEffect(() => {
    const fetchLiveWeatherData = async (lat, lng) => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&timezone=auto`;
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi&timezone=auto`;

        const [weatherResponse, airResponse] = await Promise.all([
          fetch(weatherUrl),
          fetch(airUrl),
        ]);

        if (!weatherResponse.ok || !airResponse.ok) {
          throw new Error("Weather service unavailable");
        }

        const weatherData = await weatherResponse.json();
        const airData = await airResponse.json();
        const currentWeather = weatherData.current || {};
        const currentAir = airData.current || {};
        const temp = Number(currentWeather.temperature_2m ?? 31);
        const humidity = Number(currentWeather.relative_humidity_2m ?? 68);
        const uvIndex = Number(currentWeather.uv_index ?? 7);
        const precipitation = Number(currentWeather.precipitation ?? 0);
        const windSpeed = Number(currentWeather.wind_speed_10m ?? 12);
        const weatherCode = Number(currentWeather.weather_code ?? 0);
        const airQuality = Number(currentAir.us_aqi ?? 42);
        const conditionLabel = getWeatherConditionLabel(weatherCode);

        let alert = "Conditions are stable at the moment.";
        if (temp > 35 || airQuality > 90 || precipitation > 12 || (weatherCode >= 95 && weatherCode <= 99)) {
          alert = "Extreme conditions detected: heat, storm, flood, or poor air quality risk is elevated.";
        } else if (temp > 30 || airQuality > 60 || precipitation > 5 || uvIndex > 6) {
          alert = "High alert: outdoor exposure may be risky. Watch for heat stress or heavy weather.";
        }

        setLiveWeather({
          temp,
          humidity,
          uvIndex,
          airQuality,
          precipitation,
          windSpeed,
          weatherCode,
          summary: conditionLabel,
          alert,
          isLoading: false,
        });
      } catch (error) {
        console.warn("Weather API fetch failed", error);
        setLiveWeather((prev) => ({
          ...prev,
          isLoading: false,
          alert: "Live weather data could not be reached. Local safety guidance is still active.",
        }));
      }
    };

    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLat = position.coords.latitude;
          const nextLng = position.coords.longitude;

          setDeviceLocation({
            lat: nextLat,
            lng: nextLng,
            label: "Current device location",
            permission: "granted",
            error: "",
          });
          setDeviceAccess((prev) => ({ ...prev, gps: true }));
          fetchLiveWeatherData(nextLat, nextLng);
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
          setLiveWeather((prev) => ({
            ...prev,
            isLoading: false,
            alert: "Location access is not available, so live weather conditions are temporarily unavailable.",
          }));
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
      setLiveWeather((prev) => ({
        ...prev,
        isLoading: false,
        alert: "This browser does not support location-based weather monitoring.",
      }));
    }

    setDeviceAccess((prev) => ({ ...prev, wearables: true }));
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      unlockAudio();
    };

    window.addEventListener("pointerdown", handleUserInteraction, { once: true });
    window.addEventListener("keydown", handleUserInteraction, { once: true });
    window.addEventListener("touchstart", handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (!isDangerState) return;

    const riskTypes = [];
    if (isHealthDanger) riskTypes.push("health");
    if (isEnvironmentDanger) riskTypes.push("environment");

    const playAlertTone = () => {
      riskTypes.forEach((riskType, index) => {
        setTimeout(() => {
          triggerRiskTone(riskType);
        }, index * 180);
      });
    };

    playAlertTone();

    const buzzer = setInterval(() => {
      playAlertTone();
    }, 3500);

    const timer = setTimeout(() => {
      dialEmergencyContacts();
    }, 1200);

    return () => {
      clearInterval(buzzer);
      clearTimeout(timer);
    };
  }, [isDangerState, isHealthDanger, isEnvironmentDanger]);

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

  const anomalyScore = Math.min(100, Math.round(
    current.stress * 0.35 +
    (100 - current.recovery) * 0.3 +
    (current.sleep < 7 ? (7 - current.sleep) * 18 : 0) +
    (environment.airQuality > 55 ? (environment.airQuality - 55) * 0.9 : 0) +
    (environment.temp > 30 ? (environment.temp - 30) * 4 : 0)
  ));
  const anomalyStatus = anomalyScore >= 75 ? "High anomaly risk" : anomalyScore >= 45 ? "Moderate anomaly risk" : "Stable pattern";

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

  const tabConfig = [
    { id: "health", label: "Health overview", icon: HeartPulse },
    { id: "anomaly", label: "Real-time anomaly detection", icon: Activity },
    { id: "disaster", label: "Disaster mode", icon: ShieldCheck },
    { id: "environment", label: "Environment overview", icon: ShieldCheck },
    { id: "overall", label: "Psychological + environment", icon: Brain },
    { id: "emergency", label: "Emergency", icon: Activity },
  ];

  const overviewConfig = {
    health: {
      header: "Health overview",
      score: personalHealthScore,
      scoreLabel: scoreLabel === "excellent" ? "Excellent" : scoreLabel === "stable" ? "Stable" : "Watch",
      badgeColor: scoreLabel === "excellent" ? T.good : scoreLabel === "stable" ? T.accent : T.warm,
      metrics: [
        { label: "Sleep", value: `${current.sleep.toFixed(1)}h`, icon: MoonStar, color: T.accent },
        { label: "Stress", value: `${current.stress}/100`, icon: Gauge, color: T.warm },
        { label: "Recovery", value: `${current.recovery}/100`, icon: HeartPulse, color: T.accent2 },
        { label: "Focus", value: `${current.focus}/100`, icon: Brain, color: T.good },
      ],
      cards: [
        { title: "Personal health score", detail: `Your personal health score is ${personalHealthScore}, reflecting recovery, sleep quality, stress stability, and focus consistency.`, value: `${personalHealthScore}`, suffix: "", meta: "Overall health", icon: HeartPulse, color: "rgba(78,226,199,0.14)" },
        { title: "Sleep baseline", detail: `Compared with your 7-day rhythm, sleep is ${getTrendLabel(current.sleep, sleepAverage)} hours from baseline.`, value: `${current.sleep.toFixed(1)}`, suffix: "h", meta: `7d avg ${sleepAverage.toFixed(1)}h`, icon: MoonStar, color: "rgba(78,226,199,0.14)" },
        { title: "Recovery", detail: `Your bodily resilience is trending ${current.recovery >= recoveryAverage ? "above" : "below"} your baseline.`, value: `${current.recovery}`, suffix: "", meta: `avg ${recoveryAverage.toFixed(0)}`, icon: HeartPulse, color: "rgba(139,124,246,0.12)" },
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
    if (activeTab === "anomaly") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Current anomaly signals</h2>
              <div className="panel-copy">Real-time pattern check</div>
            </div>
            <div className="signal-list" style={{ padding: 0 }}>
              {[
                ["Sleep debt", current.sleep < 7 ? `${(7 - current.sleep).toFixed(1)}h short` : "Normal", current.sleep < 7 ? "Alert" : "Stable", "linear-gradient(90deg, #4ee2c7, #8b7cf6)"],
                ["Recovery fall", `${Math.max(0, recoveryAverage - current.recovery).toFixed(0)} pts`, `${current.recovery < recoveryAverage ? "Detected" : "Normal"}`, "linear-gradient(90deg, #ff6b6b, #ffbf69)"],
                ["Stress spike", `${current.stress}/100`, current.stress > 45 ? "Detected" : "Stable", "linear-gradient(90deg, #ffbf69, #ff8a5b)"],
                ["Weather stress", `${environment.airQuality} AQI`, environment.airQuality > 45 ? "Detected" : "Normal", "linear-gradient(90deg, #6ec6ff, #8b7cf6)"],
              ].map(([label, value, state, color], index) => (
                <div className="signal-row" key={label} style={{ marginBottom: index < 3 ? 10 : 0 }}>
                  <span className="signal-label">{label}</span>
                  <div className="signal-right">
                    <div className="progress"><span style={{ width: `${Math.min(100, label === "Stress spike" ? current.stress : label === "Weather stress" ? environment.airQuality : label === "Recovery fall" ? Math.max(0, recoveryAverage - current.recovery) * 2 : 60)}%`, background: color }} /></div>
                    <div className="signal-score">{value}</div>
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

    if (activeTab === "disaster") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Disaster mode overview</h2>
              <div className="panel-copy">Danger detection</div>
            </div>
            <div className="alert-box" style={{ margin: 0 }}>
              <div className="alert-header">
                <h3>{disasterLabel}</h3>
                <div className="alert-badge">{weatherDangerScore} / 100</div>
              </div>
              <div className="status-strip">
                <div className="status-card">
                  <div className="status-label">Heat</div>
                  <div className="status-value">{environment.temp > 30 ? "High" : "Normal"}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Air</div>
                  <div className="status-value">{environment.airQuality > 45 ? "Poor" : "Safe"}</div>
                </div>
              </div>
              <div className="sms-box">
                {environmentSummary}
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Weather safety steps</h2>
              <div className="panel-copy">Immediate protection</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {[
                { title: "Heat shield", detail: environment.temp > 30 ? "Avoid outdoor tasks during peak heat and keep cooling measures ready." : "Stay hydrated and opportunistically cool down during the hottest hours.", icon: Thermometer, color: T.warm },
                { title: "Air safety", detail: environment.airQuality > 45 ? "Reduce outdoor exertion, protect breathing, and keep a mask available." : "Air exposure remains manageable, but continue monitoring if the AQI rises.", icon: Activity, color: T.accent },
                { title: "Hydration cycle", detail: "Drink water regularly and keep ORS or electrolyte support nearby in strong heat conditions.", icon: MoonStar, color: T.accent2 },
                { title: "Emergency prep", detail: "Keep your emergency contacts ready and avoid unnecessary travel when danger levels are high.", icon: PhoneCall, color: T.danger },
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

    if (activeTab === "environment") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Environmental risk data</h2>
              <div className="panel-copy">Live monitor</div>
            </div>
            <div className="signal-list" style={{ padding: 0 }}>
              {[
                ["Air quality", environment.airQuality, `${environment.airQuality} AQI`, "linear-gradient(90deg, #4ee2c7, #8b7cf6)"],
                ["Heat index", environment.temp, `${environment.temp}°C`, "linear-gradient(90deg, #ffbf69, #ff8a5b)"],
                ["Humidity", environment.humidity, `${environment.humidity}%`, "linear-gradient(90deg, #6ec6ff, #8b7cf6)"],
                ["UV index", environment.uvIndex, `${environment.uvIndex}/10`, "linear-gradient(90deg, #ffd166, #ff8a5b)"],
              ].map(([label, value, metric, color], index) => (
                <div className="signal-row" key={label} style={{ marginBottom: index < 3 ? 10 : 0 }}>
                  <span className="signal-label">{label}</span>
                  <div className="signal-right">
                    <div className="progress"><span style={{ width: `${Math.min(typeof value === 'number' ? value * (label === 'UV index' ? 14 : label === 'Heat index' ? 4 : label === 'Humidity' ? 1 : 1) : 100, 100)}%`, background: color }} /></div>
                    <div className="signal-score">{metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Environment recommendations</h2>
              <div className="panel-copy">Action plan</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {[
                { title: "Hydration", detail: "Drink water regularly and carry electrolyte support during hot periods.", icon: MoonStar, color: T.accent },
                { title: "Reduce UV exposure", detail: "Wear a hat, sunscreen, and limit midday outdoor work when UV is elevated.", icon: ShieldCheck, color: T.warm },
                { title: "Air quality safety", detail: "Keep masks and cleaner indoor air available on days with rising AQI.", icon: Activity, color: T.accent2 },
                { title: "Heat stress response", detail: "Take breaks in cool spaces and avoid strenuous activity during peak heat hours.", icon: HeartPulse, color: T.danger },
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
      const primaryRisk = isHealthDanger && isEnvironmentDanger
        ? "Both health and environmental conditions are elevated"
        : isHealthDanger
          ? "Health risks are elevated"
          : isEnvironmentDanger
            ? "Environmental hazards are elevated"
            : "No immediate danger signals";

      const riskDrivers = [
        isHealthDanger ? `Stress level ${current.stress}/100 with recovery at ${current.recovery}/100` : "Health metrics remain within a stable range",
        isEnvironmentDanger ? `Air quality ${environment.airQuality} AQI, temperature ${environment.temp}°C, UV ${environment.uvIndex}/10` : "Environmental metrics are relatively stable",
        deviceLocation.lat !== null && deviceLocation.lng !== null ? `Live location available: ${deviceLocation.lat.toFixed(4)}, ${deviceLocation.lng.toFixed(4)}` : "Location share is not active yet; enable GPS for faster emergency help",
      ];

      const responseSteps = [
        { title: "Immediate safety", detail: isDangerState ? "Move to a cool, safe indoor place and avoid strenuous activity until the risk falls." : "Keep hydration and a rapid-response plan ready in case the risk rises.", icon: ShieldCheck, color: T.warm },
        { title: "Health check", detail: isHealthDanger ? "Focus on rest, hydration, and symptom monitoring for dizziness, confusion, chest pain, or sudden fatigue." : "Monitor for changes in stress, energy, and sleep quality during the next few hours.", icon: HeartPulse, color: T.danger },
        { title: "Environmental response", detail: isEnvironmentDanger ? "Reduce outdoor exposure, use shade or masks, and keep cooling supplies nearby while AQI or heat remains high." : "Continue routine monitoring; conditions are manageable for now.", icon: Activity, color: T.accent },
        { title: "Emergency contact", detail: "Share your live map and send a message to all saved contacts if symptoms worsen or conditions become unsafe.", icon: PhoneCall, color: T.accent2 },
      ];

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
                  <div className="status-value" style={{ color: isHealthDanger ? T.danger : T.good }}>{isHealthDanger ? "Elevated" : "Stable"}</div>
                </div>
                <div className="status-card">
                  <div className="status-label">Environment</div>
                  <div className="status-value" style={{ color: isEnvironmentDanger ? T.warm : T.good }}>{isEnvironmentDanger ? "Unsafe" : "Safe"}</div>
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

              <div className="sms-box" style={{ marginTop: 12 }}>
                <strong>Current risk summary:</strong> {primaryRisk}
              </div>

              <div className="alert-contact-list" style={{ marginTop: 12 }}>
                {riskDrivers.map((driver, index) => (
                  <div className="sms-box" key={`${driver}-${index}`} style={{ marginTop: 0, marginBottom: 8 }}>
                    {driver}
                  </div>
                ))}
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
                <button className="action-secondary" onClick={openWeatherMap}>Live weather map</button>
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

              <div className="sms-box" style={{ marginTop: 8 }}>
                <strong>Live weather watch (Open-Meteo):</strong> {environment.summary} — {environment.alert}
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
              <h2>Emergency plan</h2>
              <div className="panel-copy">Quick actions</div>
            </div>
            <div className="action-list" style={{ margin: 0 }}>
              {responseSteps.map(({ title, detail, icon: Icon, color }) => (
                <div className="action-item" key={title}>
                  <div className="action-icon" style={{ background: `${color}14`, color }}><Icon size={18} /></div>
                  <div>
                    <h4>{title}</h4>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="insight-box" style={{ marginTop: 18 }}>
              <div className="tag">Emergency escalation</div>
              <p>
                {isDangerState
                  ? "If symptoms become severe, call emergency services immediately, move to a safer area, and continue sharing your location with trusted contacts until the risk is resolved."
                  : "Keep your plan ready: monitor the latest readings, maintain hydration, and check in with contacts if stress or environmental indicators begin to trend upward."}
              </p>
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
    <div style={{ background: "radial-gradient(circle at top, rgba(0, 217, 255, 0.12), transparent 28%), linear-gradient(180deg, #05070D 0%, #0A111C 60%, #05070D 100%)", minHeight: "100vh", color: T.text, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: ${T.bg};
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        h1, h2, h3, h4, h5, h6, strong, b { font-family: 'Poppins', 'Segoe UI', sans-serif; letter-spacing: -0.04em; }
        button, input, select, textarea { font-family: 'Poppins', 'Segoe UI', sans-serif; letter-spacing: 0.01em; }
        button, select { font: inherit; }
        .page { max-width: 1200px; width: 100%; margin: 0 auto; padding: 28px 22px 48px; display: flex; flex-direction: column; align-items: center; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 24px; width: 100%; padding: 10px 0; }
        .tab-bar { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 24px; justify-content: center; align-items: center; width: 100%; }
        .tab-btn { border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.textDim}; border-radius: 12px; padding: 10px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
        .tab-btn.active { background: rgba(22,181,166,0.12); color: ${T.text}; border-color: rgba(22,181,166,0.32); }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark { width: 40px; height: 40px; border-radius: 14px; background: linear-gradient(135deg, rgba(22,181,166,0.12), rgba(79,110,247,0.12)); border: 1px solid rgba(22,181,166,0.25); display:flex; align-items:center; justify-content:center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7); }
        .brand-name { font-size: 24px; font-weight: 700; letter-spacing: -0.04em; }
        .status-pill { border: 1px solid ${T.border}; background: rgba(255,255,255,0.8); border-radius: 999px; padding: 8px 12px; color: ${T.textDim}; font-size: 12px; display: inline-flex; align-items:center; gap:8px; }
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
      `}</style>

      <div className="page">
        {showContactPicker && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(3, 12, 18, 0.76)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 40 }}>
            <div className="panel" style={{ width: "min(560px, 100%)", padding: 22 }}>
              <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Connect your phone</h2>
                <div className="panel-copy">Sync your personal contacts securely</div>
              </div>

              {phoneConnectMode === "choose" && (
                <>
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: `1px solid ${T.borderSoft}`, background: "rgba(78,226,199,0.06)", color: T.textDim, fontSize: 13, lineHeight: 1.6 }}>
                    Enable automatic access to the connected phone for contacts, live GPS, and offline wearable sensors.
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                    <button className="primary-btn" onClick={requestConnectedDeviceAccess}>Grant automatic device access</button>
                    <button className="secondary-btn" onClick={handleOpenCompanionApp}>Open companion app</button>
                    <button className="secondary-btn" onClick={() => setPhoneConnectMode("pair")}>Enter pairing code</button>
                  </div>

                  <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, color: T.textDim, lineHeight: 1.6 }}>
                    Real contacts, GPS, and wearable sensor data are pulled from the connected device only. This keeps access truly device-based instead of using demo data.
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                    <button className="secondary-btn" onClick={() => setShowContactPicker(false)}>Cancel</button>
                    <button className="primary-btn" onClick={handleContactPickerSubmit}>Use connected device</button>
                  </div>
                </>
              )}

              {phoneConnectMode === "pair" && (
                <div style={{ display: "grid", gap: 16, marginTop: 14 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "rgba(139,124,246,0.08)", border: `1px solid rgba(139,124,246,0.25)`, color: T.textDim, textAlign: "center" }}>
                    Pairing code: <strong style={{ color: T.text, letterSpacing: 1.5 }}>{pairingCode}</strong>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: 8, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>
                    Enter pairing code
                    <input
                      value={enteredPairingCode}
                      onChange={(e) => setEnteredPairingCode(e.target.value)}
                      placeholder="RAK-4821"
                      style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(6,18,26,0.8)", color: T.text, padding: "12px 14px", fontSize: 14 }}
                    />
                  </label>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button className="secondary-btn" onClick={() => setPhoneConnectMode("choose")}>Back</button>
                    <button className="primary-btn" onClick={finishPhoneSync}>Confirm pairing</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><LogoMark size={18} color={T.accent} /></div>
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
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <section className="hero">
          <div className="panel hero-panel">
            <div className="eyebrow"><Sparkles size={12} /> {overviewConfig[activeTab].header}</div>
            <h1>
              {activeTab === "health" && <>Your personal health score is <span className="gradient-text">strong and stable</span></>}
              {activeTab === "anomaly" && <>Real-time health alerts are <span className="gradient-text">tracking your drift</span></>}
              {activeTab === "disaster" && <>Weather danger is <span className="gradient-text">being detected live</span></>}
              {activeTab === "environment" && <>Your environment is <span className="gradient-text">under watch</span></>}
              {activeTab === "overall" && <>Your mental and environmental balance is <span className="gradient-text">being monitored</span></>}
            </h1>
            <div className="subtext">
              {activeTab === "health" && "Track your personal rhythm across sleep, recovery, focus, and stress — then let AI surface the small changes that matter before they become setbacks."}
              {activeTab === "anomaly" && "Monitor sudden recovery drops, sleep drift, stress spikes, and heat-related anomalies before they turn into a health event."}
              {activeTab === "disaster" && "This mode reads the current weather conditions and highlights the danger level so you can act early during heat, air-quality, or UV-heavy conditions."}
              {activeTab === "environment" && "Monitor air quality, heat, humidity, and UV levels to protect your body and daily routine when outdoor conditions worsen."}
              {activeTab === "overall" && "Review your focus, mood, stress, and environment together to understand how your psychological state and conditions work as one system."}
            </div>
            <div className="cta-row">
              <button className="primary-btn" onClick={handleTodayStatus}>View today</button>
              <button className="secondary-btn" onClick={handleAdjustGoals}>Adjust goals</button>
            </div>
          </div>

          <div className="panel score-panel">
            <div>
              <div className="score-label">
                {activeTab === "health" ? "Personal health score" : activeTab === "anomaly" ? "Anomaly risk" : activeTab === "disaster" ? "Weather danger" : activeTab === "environment" ? "Environment score" : "Integrated score"}
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
