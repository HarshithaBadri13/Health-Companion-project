/*
 * Rakshak — On-Device Health Guardian (React component)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Heart, Activity, Wind, CloudRain, Thermometer, ShieldAlert, Siren,
  Lock, MapPin, Phone, TrendingUp, TrendingDown, ShieldCheck, Radio,
  BellRing, ChevronDown, ChevronUp, Plus, WifiOff, Cpu, Info,
  ArrowRight, Check, Smartphone,
} from "lucide-react";

/* Design tokens */
const T = {
  bg: "#0A1A24",
  bgGrid: "#0D2029",
  surface: "#0F2431",
  surface2: "#153140",
  border: "#1D3F52",
  borderSoft: "#16303F",
  text: "#E7F3F3",
  textDim: "#8FADB8",
  textFaint: "#5D7A87",
  accent: "#2DD4BF",
  accent2: "#8B7CF6",
  safe: "#4ADE80",
  watch: "#FBBF24",
  warning: "#F97316",
  severe: "#EF4444",
};

const LEVEL_COLOR = { safe: T.safe, watch: T.watch, warning: T.warning, severe: T.severe };
const LEVEL_LABEL = { safe: "Normal", watch: "Watch", warning: "Warning", severe: "Severe" };

const REGIONS = {
  "Mumbai":       { heat: 42, flood: 68, pollution: 54, outbreak: 38 },
  "Delhi NCR":    { heat: 66, flood: 28, pollution: 89, outbreak: 44 },
  "Chennai":      { heat: 61, flood: 63, pollution: 39, outbreak: 33 },
  "Kolkata":      { heat: 53, flood: 58, pollution: 61, outbreak: 49 },
  "Bengaluru":    { heat: 24, flood: 33, pollution: 41, outbreak: 28 },
  "Patna":        { heat: 71, flood: 77, pollution: 64, outbreak: 56 },
  "Ahmedabad":    { heat: 82, flood: 19, pollution: 57, outbreak: 34 },
  "Guwahati":     { heat: 38, flood: 81, pollution: 45, outbreak: 47 },
};

const HAZARD_META = {
  heat: { label: "Heat Stress", Icon: Thermometer, unit: "index",
    tip: (lvl) => lvl === "severe" ? "IMD-style heatwave conditions. Avoid noon outdoor exposure, hydrate every 30 min, check on elderly neighbours."
      : lvl === "warning" ? "High heat load today. Limit strenuous outdoor activity 12–4pm, keep ORS at home."
      : lvl === "watch" ? "Warming trend. Keep water intake up and light-coloured, loose clothing handy." : "Comfortable range. No special precautions needed." },
  flood: { label: "Flood Risk", Icon: CloudRain, unit: "index",
    tip: (lvl) => lvl === "severe" ? "Heavy waterlogging likely. Keep documents & medicines in a waterproof bag, know your evacuation route, avoid wading through water."
      : lvl === "warning" ? "Rising water-level risk. Charge devices, store 2 days of drinking water, avoid low-lying underpasses."
      : lvl === "watch" ? "Monsoon build-up detected. Recheck your emergency kit." : "No significant flood signal." },
  pollution: { label: "Air Quality", Icon: Wind, unit: "AQI-like",
    tip: (lvl) => lvl === "severe" ? "Hazardous air. N95 outdoors, air purifier indoors, asthma/COPD users keep inhalers within reach."
      : lvl === "warning" ? "Poor air quality. Reduce outdoor exertion, sensitive groups should mask up." 
      : lvl === "watch" ? "Air quality dipping. Keep an eye on it if you have a respiratory condition." : "Air quality is acceptable." },
  outbreak: { label: "Community Health Signal", Icon: Activity, unit: "anonymised index",
    tip: (lvl) => lvl === "severe" ? "Elevated fever/flu-pattern signal nearby (anonymised, opt-in data). Consider a mask indoors, monitor symptoms closely."
      : lvl === "warning" ? "Rising local syndromic signal. Basic hygiene precautions advised." 
      : lvl === "watch" ? "Slight uptick in anonymised community symptom reports." : "No unusual community health signal." },
};

function levelOf(value) {
  if (value <= 30) return "safe";
  if (value <= 55) return "watch";
  if (value <= 75) return "warning";
  return "severe";
}

const VITAL_RULES = {
  hr: {
    label: "Heart Rate", unit: "bpm", Icon: Heart,
    level: (v) => (v < 45 || v > 130) ? "severe" : (v < 50 || v > 115) ? "warning" : (v < 58 || v > 100) ? "watch" : "safe",
  },
  spo2: {
    label: "SpO₂", unit: "%", Icon: Activity,
    level: (v) => v < 88 ? "severe" : v < 92 ? "warning" : v < 95 ? "watch" : "safe",
  },
  hrv: {
    label: "HRV", unit: "ms", Icon: TrendingUp,
    level: (v) => v < 20 ? "severe" : v < 35 ? "warning" : v < 50 ? "watch" : "safe",
  },
  stress: {
    label: "Stress Index", unit: "/100", Icon: Radio,
    level: (v) => v > 82 ? "severe" : v > 62 ? "warning" : v > 42 ? "watch" : "safe",
  },
};
const LEVEL_SCORE = { safe: 12, watch: 42, warning: 70, severe: 92 };

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

function useVitalsStream() {
  const [vitals, setVitals] = useState({ hr: 74, spo2: 97, hrv: 58, stress: 30 });
  const [history, setHistory] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ t: i, hr: 74, hrv: 58 }))
  );
  const tick = useRef(24);

  useEffect(() => {
    const id = setInterval(() => {
      setVitals((prev) => {
        const next = {
          hr: clamp(prev.hr + rand(-3, 3), 48, 138),
          spo2: clamp(prev.spo2 + rand(-1, 1), 84, 100),
          hrv: clamp(prev.hrv + rand(-4, 4), 15, 90),
          stress: clamp(prev.stress + rand(-5, 6), 5, 95),
        };
        tick.current += 1;
        setHistory((h) => [...h.slice(-39), { t: tick.current, hr: next.hr, hrv: next.hrv }]);
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return { vitals, history };
}

function useHazardStream(region) {
  const base = REGIONS[region];
  const [hazards, setHazards] = useState(base);

  useEffect(() => { setHazards(base); }, [region]);

  useEffect(() => {
    const id = setInterval(() => {
      setHazards((prev) => ({
        heat: clamp(prev.heat + rand(-2, 2), 0, 100),
        flood: clamp(prev.flood + rand(-2, 2), 0, 100),
        pollution: clamp(prev.pollution + rand(-2, 2), 0, 100),
        outbreak: clamp(prev.outbreak + rand(-1.5, 1.5), 0, 100),
      }));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return hazards;
}

export default function RakshakHealthGuardian() {
  const [showLanding, setShowLanding] = useState(true);
  const { vitals, history } = useVitalsStream();
  const [region, setRegion] = useState("Mumbai");
  const hazards = useHazardStream(region);
  const [shareAnon, setShareAnon] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [contacts, setContacts] = useState([
    { name: "Amma", phone: "+91 98xxxxxx12" },
    { name: "Dr. Rao (Family Physician)", phone: "+91 98xxxxxx45" },
  ]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const lastLevels = useRef({});

  const vitalLevels = useMemo(() => {
    const out = {};
    for (const key of Object.keys(VITAL_RULES)) out[key] = VITAL_RULES[key].level(vitals[key]);
    return out;
  }, [vitals]);

  const hazardLevels = useMemo(() => {
    const out = {};
    for (const key of Object.keys(hazards)) out[key] = levelOf(hazards[key]);
    return out;
  }, [hazards]);

  const personalRisk = useMemo(() => {
    const scores = Object.keys(vitalLevels).map((k) => LEVEL_SCORE[vitalLevels[k]]);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [vitalLevels]);

  const environmentalRisk = useMemo(() => {
    const vals = Object.values(hazards);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [hazards]);

  const compositeRisk = Math.round(personalRisk * 0.6 + environmentalRisk * 0.4);
  const compositeLevel = levelOf(compositeRisk);

  const pushAlert = useCallback((msg, level, source) => {
    setAlerts((a) => [
      { id: Date.now() + Math.random(), msg, level, source, time: new Date() },
      ...a,
    ].slice(0, 12));
  }, []);

  useEffect(() => {
    const all = { ...vitalLevels, ...hazardLevels };
    for (const key of Object.keys(all)) {
      const lvl = all[key];
      const prevLvl = lastLevels.current[key];
      const rank = { safe: 0, watch: 1, warning: 2, severe: 3 };
      if (lvl !== prevLvl && rank[lvl] >= 2 && rank[lvl] >= (rank[prevLvl] ?? 0)) {
        const isVital = key in VITAL_RULES;
        const label = isVital ? VITAL_RULES[key].label : HAZARD_META[key].label;
        pushAlert(
          `${label} moved to ${LEVEL_LABEL[lvl]}${isVital ? ` (${vitals[key].toFixed(0)} ${VITAL_RULES[key].unit})` : ""}`,
          lvl,
          isVital ? "On-device vitals" : "Regional hazard feed"
        );
      }
      lastLevels.current[key] = lvl;
    }
  }, [vitalLevels, hazardLevels, vitals, pushAlert]);

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    setContacts((c) => [...c, newContact]);
    setNewContact({ name: "", phone: "" });
  };

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .disp { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .rk-scroll::-webkit-scrollbar { width: 6px; }
        .rk-scroll::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }

        @keyframes rk-pulse-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .rk-wave-track {
          display: flex;
          width: 200%;
          animation: rk-pulse-scroll 6s linear infinite;
        }
        .rk-wave-track svg { flex-shrink: 0; }

        @keyframes rk-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        .rk-live-dot { animation: rk-blink 1.6s ease-in-out infinite; }

        .rk-card { transition: border-color .2s ease, transform .2s ease; }
        .rk-card:hover { border-color: ${T.accent}55; }

        input[type="text"] { outline: none; }
      `}</style>

      {/* HERO */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: `radial-gradient(1100px 420px at 15% -10%, ${T.accent}14, transparent 60%), radial-gradient(900px 380px at 100% 0%, ${T.accent2}12, transparent 55%)` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.accent}40` }}>
                  <ShieldCheck size={18} color={T.accent} />
                </div>
                <span className="disp" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.2 }}>Rakshak</span>
                <span className="mono" style={{ fontSize: 10, color: T.textFaint, border: `1px solid ${T.borderSoft}`, borderRadius: 6, padding: "2px 6px" }}>ON-DEVICE</span>
              </div>
              <p style={{ color: T.textDim, fontSize: 13.5, marginTop: 6, maxWidth: 480, lineHeight: 1.5 }}>
                Private, on-device early warning for your body and your surroundings —
                built for India's heat, floods, pollution, and disease waves.
              </p>
            </div>

            <div className="rk-card" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 18px", minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: T.textFaint, textTransform: "uppercase", letterSpacing: 0.6 }}>Composite Risk</span>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: LEVEL_COLOR[compositeLevel] }} className="rk-live-dot" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span className="disp mono" style={{ fontSize: 34, fontWeight: 700, color: LEVEL_COLOR[compositeLevel] }}>{compositeRisk}</span>
                <span style={{ fontSize: 13, color: T.textDim }}>/ 100 · {LEVEL_LABEL[compositeLevel]}</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: T.textFaint }}>
                <span>You: <b className="mono" style={{ color: T.text }}>{personalRisk}</b></span>
                <span>Region: <b className="mono" style={{ color: T.text }}>{environmentalRisk}</b></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.borderSoft}`, background: T.bgGrid, position: "relative", height: 84 }}>
            <div className="rk-wave-track" style={{ height: 84 }}>
              {[0, 1].map((copy) => (
                <PulseWave key={copy} color={LEVEL_COLOR[compositeLevel]} />
              ))}
            </div>
            <div style={{ position: "absolute", left: 14, top: 10, fontSize: 10, color: T.textFaint, letterSpacing: 1, textTransform: "uppercase" }}>
              live vitals · simulated on-device feed
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 60px", display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

          <Section title="Your Vitals" icon={<Heart size={15} color={T.accent} />} note="Simulated wearable stream, processed on-device">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {Object.entries(VITAL_RULES).map(([key, rule]) => (
                <VitalCard key={key} rule={rule} value={vitals[key]} level={vitalLevels[key]} />
              ))}
            </div>
          </Section>

          <Section title="24-min Trend" icon={<TrendingUp size={15} color={T.accent} />} note="Heart rate & HRV — the pattern early-warning looks at">
            <div style={{ height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={T.borderSoft} vertical={false} />
                  <XAxis dataKey="t" tick={false} stroke={T.borderSoft} />
                  <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} stroke={T.borderSoft} width={30} />
                  <Tooltip contentStyle={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} labelFormatter={() => ""} />
                  <Line type="monotone" dataKey="hr" stroke={T.accent} strokeWidth={2} dot={false} name="Heart rate" />
                  <Line type="monotone" dataKey="hrv" stroke={T.accent2} strokeWidth={2} dot={false} name="HRV" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textDim, marginTop: 2 }}>
              <LegendDot color={T.accent} label="Heart rate (bpm)" />
              <LegendDot color={T.accent2} label="HRV (ms)" />
            </div>
          </Section>

          <Section
            title="Disaster & Health-Wave Resilience"
            icon={<ShieldAlert size={15} color={T.accent} />}
            note="Simulated regional feed — stands in for IMD / CWC / CPCB / IDSP"
            right={
              <RegionPicker region={region} setRegion={setRegion} />
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {Object.entries(HAZARD_META).map(([key, meta]) => (
                <HazardCard key={key} meta={meta} value={hazards[key]} level={hazardLevels[key]} />
              ))}
            </div>
          </Section>

          <div className="rk-card" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
            <button
              onClick={() => setShowArchitecture((s) => !s)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", color: T.text }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                <Cpu size={15} color={T.accent2} /> How the on-device intelligence works
              </span>
              {showArchitecture ? <ChevronUp size={16} color={T.textDim} /> : <ChevronDown size={16} color={T.textDim} />}
            </button>
            {showArchitecture && (
              <div style={{ padding: "0 18px 18px", color: T.textDim, fontSize: 13, lineHeight: 1.7 }}>
                <ArchPoint text="A lightweight model runs locally on the phone or a bedside hub — no vitals are ever sent to a server for this scoring." />
                <ArchPoint text="Rules + learned baselines flag drift (e.g. resting HR climbing while HRV falls) days before symptoms are obvious." />
                <ArchPoint text="Regional hazard levels come from public feeds (IMD heat advisories, CWC flood forecasts, CPCB/SAFAR AQI); these combine with your personal baseline so guidance is adjusted for the day, not generic." />
                <ArchPoint text="Community outbreak signal is optional and privacy-preserving: only anonymised, aggregated, k-anonymized patterns are ever shared, never raw symptoms or identity." />
                <ArchPoint text="Offline-first: cached hazard data and on-device inference keep working when the network drops mid-disaster." />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>

          <Section title="Early-Warning Feed" icon={<BellRing size={15} color={T.warning} />} note={alerts.length ? `${alerts.length} alert${alerts.length > 1 ? "s" : ""}` : "All clear"}>
            <div className="rk-scroll" style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.textFaint, fontSize: 12.5, padding: "10px 2px" }}>
                  <ShieldCheck size={14} /> No early warnings right now — you'll see them here the moment something drifts.
                </div>
              )}
              {alerts.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: T.surface2, border: `1px solid ${LEVEL_COLOR[a.level]}33` }}>
                  <div style={{ width: 6, borderRadius: 4, background: LEVEL_COLOR[a.level], flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: T.text }}>{a.msg}</div>
                    <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>{a.source} · {a.time.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Privacy, By Design" icon={<Lock size={15} color={T.accent2} />}>
            <PrivacyRow
              title="Vitals stay on this device"
              desc="Heart rate, SpO₂, HRV and stress readings are processed and stored locally. They are never uploaded."
              locked
            />
            <ToggleRow
              title="Share anonymised trend for public health"
              desc="Off by default. If enabled, only a differentially-private aggregate signal (no raw data, no identity) helps your local health authority spot community-wide waves earlier."
              value={shareAnon}
              onChange={setShareAnon}
            />
            <ToggleRow
              title="Offline mode"
              desc="Simulates a disaster network outage. On-device scoring and cached hazard data keep working; only live hazard updates pause."
              value={offlineMode}
              onChange={setOfflineMode}
              icon={offlineMode ? <WifiOff size={13} color={T.warning} /> : null}
            />
          </Section>

          <Section title="Emergency Support" icon={<Siren size={15} color={T.severe} />}>
            <button
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.severe}55`,
                background: `${T.severe}18`, color: T.severe, fontWeight: 600, fontSize: 13.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 14,
              }}
              onClick={() => pushAlert("SOS drafted — would notify emergency contacts with your composite risk and location.", "severe", "Manual SOS")}
            >
              <Siren size={16} /> Send SOS to emergency contacts
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, background: T.surface2, border: `1px solid ${T.borderSoft}` }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: T.text }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: T.textFaint }}>{c.phone}</div>
                  </div>
                  <Phone size={14} color={T.textDim} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input
                placeholder="Name" value={newContact.name}
                onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
                style={{ flex: 1, background: T.bgGrid, border: `1px solid ${T.borderSoft}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12 }}
              />
              <input
                placeholder="Phone" value={newContact.phone}
                onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))}
                style={{ flex: 1, background: T.bgGrid, border: `1px solid ${T.borderSoft}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12 }}
              />
              <button onClick={addContact} style={{ background: T.accent, border: "none", borderRadius: 8, padding: "0 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Plus size={15} color="#04211D" />
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* Sub-components */
function LandingPage({ onEnter }) {
  return (
    <div className="landing-shell">
      <style>{`
        .landing-shell {
          min-height: 100vh;
          overflow: hidden;
          color: ${T.text};
          background: ${T.bg};
          font-family: 'Inter', system-ui, sans-serif;
          background-image: linear-gradient(${T.borderSoft}33 1px, transparent 1px), linear-gradient(90deg, ${T.borderSoft}33 1px, transparent 1px), radial-gradient(800px 520px at 72% 22%, ${T.accent}16, transparent 68%);
          background-size: 56px 56px, 56px 56px, auto;
        }
        .landing-nav, .landing-main, .landing-footer { max-width: 1180px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
        .landing-nav { padding-top: 26px; display: flex; align-items: center; justify-content: space-between; }
        .landing-brand { display: flex; align-items: center; gap: 10px; }
        .landing-mark { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid ${T.accent}55; border-radius: 11px; background: ${T.accent}18; }
        .landing-nav-note { color: ${T.textDim}; font-size: 11px; letter-spacing: .7px; text-transform: uppercase; }
        .landing-main { padding-top: 86px; padding-bottom: 76px; }
        .landing-hero { display: grid; grid-template-columns: minmax(0, .92fr) minmax(420px, 1.08fr); gap: 72px; align-items: center; }
        .landing-kicker { display: flex; align-items: center; gap: 8px; color: ${T.accent}; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; font-weight: 700; }
        .landing-kicker span { width: 24px; height: 1px; background: ${T.accent}; }
        .landing-title { max-width: 590px; margin: 20px 0 22px; font-family: 'Space Grotesk', system-ui, sans-serif; font-size: clamp(44px, 6vw, 78px); line-height: .98; letter-spacing: -2px; }
        .landing-title em { color: ${T.accent}; font-style: normal; }
        .landing-copy { max-width: 500px; color: ${T.textDim}; font-size: 17px; line-height: 1.65; }
        .landing-actions { display: flex; align-items: center; gap: 18px; margin-top: 32px; flex-wrap: wrap; }
        .landing-cta { display: inline-flex; align-items: center; gap: 10px; padding: 14px 19px; border: 0; border-radius: 10px; background: ${T.accent}; color: #04211D; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 12px 30px ${T.accent}20; transition: transform .2s ease, box-shadow .2s ease; }
        .landing-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 36px ${T.accent}35; }
        .landing-privacy { display: flex; align-items: center; gap: 7px; color: ${T.textDim}; font-size: 12px; }
        .landing-preview-wrap { position: relative; }
        .landing-preview-wrap:before { content: ''; position: absolute; inset: 12% -8% -12% 8%; background: ${T.accent}18; filter: blur(70px); pointer-events: none; }
        .landing-preview { position: relative; padding: 18px; border: 1px solid ${T.border}; border-radius: 20px; background: ${T.surface}eF; box-shadow: 0 30px 80px #00000045; transform: rotate(1.5deg); }
        .preview-top { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid ${T.borderSoft}; }
        .preview-label { color: ${T.textFaint}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .preview-status { display: flex; align-items: center; gap: 6px; color: ${T.safe}; font-size: 11px; }
        .preview-status i { width: 6px; height: 6px; border-radius: 50%; background: ${T.safe}; box-shadow: 0 0 12px ${T.safe}; }
        .preview-score { display: flex; align-items: end; justify-content: space-between; padding: 22px 4px 18px; }
        .preview-score strong { color: ${T.safe}; font: 600 50px/1 'IBM Plex Mono', monospace; }
        .preview-score small { display: block; color: ${T.textDim}; font-size: 12px; margin-top: 8px; }
        .preview-spark { height: 110px; padding: 13px 0; border-top: 1px solid ${T.borderSoft}; border-bottom: 1px solid ${T.borderSoft}; }
        .preview-spark svg { width: 100%; height: 100%; }
        .preview-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 16px; }
        .preview-metric { padding: 12px; border: 1px solid ${T.borderSoft}; border-radius: 10px; background: ${T.bgGrid}; }
        .preview-metric b { display: block; margin-top: 8px; font: 600 18px 'IBM Plex Mono', monospace; }
        .preview-metric span { color: ${T.textFaint}; font-size: 10px; }
        .landing-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 110px; border-top: 1px solid ${T.border}; border-bottom: 1px solid ${T.border}; background: ${T.border}; }
        .landing-pillar { min-height: 158px; padding: 25px 26px; background: ${T.bg}; }
        .landing-pillar svg { color: ${T.accent}; }
        .landing-pillar h3 { margin: 17px 0 8px; font: 600 16px 'Space Grotesk', sans-serif; }
        .landing-pillar p { margin: 0; color: ${T.textDim}; font-size: 12px; line-height: 1.6; }
        .landing-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 23px; padding-bottom: 23px; color: ${T.textFaint}; font-size: 11px; }
        .landing-footer span { display: flex; align-items: center; gap: 7px; }
        @media (max-width: 800px) {
          .landing-nav, .landing-main, .landing-footer { padding-left: 20px; padding-right: 20px; }
          .landing-main { padding-top: 54px; }
          .landing-hero { grid-template-columns: 1fr; gap: 48px; }
          .landing-title { font-size: clamp(44px, 14vw, 68px); }
          .landing-copy { font-size: 15px; }
          .landing-preview { transform: none; }
          .landing-pillars { grid-template-columns: 1fr; margin-top: 70px; }
          .landing-pillar { min-height: auto; }
          .landing-nav-note { display: none; }
        }
      `}</style>

      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="landing-mark"><ShieldCheck size={19} color={T.accent} /></div>
          <span className="disp" style={{ fontSize: 23, fontWeight: 700 }}>Rakshak</span>
        </div>
        <span className="landing-nav-note">Your health, held close</span>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <div>
            <div className="landing-kicker"><span /> On-device health guardian</div>
            <h1 className="landing-title">Know earlier.<br /><em>Stay ready.</em></h1>
            <p className="landing-copy">Rakshak quietly watches the signals that matter, combining your body’s baseline with the world around you. Private by default. Ready when conditions change.</p>
            <div className="landing-actions">
              <button className="landing-cta" onClick={onEnter}>Open your health view <ArrowRight size={17} /></button>
              <span className="landing-privacy"><Lock size={14} color={T.accent2} /> Nothing leaves this device</span>
            </div>
          </div>
          <div className="landing-preview-wrap" aria-label="Preview of the Rakshak health monitor">
            <div className="landing-preview">
              <div className="preview-top"><span className="preview-label">Rakshak / live overview</span><span className="preview-status"><i /> Monitoring</span></div>
              <div className="preview-score"><div><strong>12</strong><small>Composite risk · Normal</small></div><ShieldCheck size={36} color={T.safe} strokeWidth={1.5} /></div>
              <div className="preview-spark"><svg viewBox="0 0 600 100" preserveAspectRatio="none" fill="none"><path d="M0 53 C25 48 35 60 54 52 S91 40 109 53 S146 68 167 50 S207 35 228 51 S263 65 284 49 S322 41 343 53 S379 68 400 49 S436 33 458 50 S492 63 514 49 S560 41 600 52" stroke={T.accent} strokeWidth="3" /><path d="M0 53 C25 48 35 60 54 52 S91 40 109 53 S146 68 167 50 S207 35 228 51 S263 65 284 49 S322 41 343 53 S379 68 400 49 S436 33 458 50 S492 63 514 49 S560 41 600 52 V100 H0Z" fill={`${T.accent}12`} stroke="none" /></svg></div>
              <div className="preview-metrics"><div className="preview-metric"><span>Heart rate</span><b>74 <small>bpm</small></b></div><div className="preview-metric"><span>SpO₂</span><b>97 <small>%</small></b></div><div className="preview-metric"><span>Air quality</span><b style={{ color: T.safe }}>54</b></div></div>
            </div>
          </div>
        </section>

        <section className="landing-pillars">
          <div className="landing-pillar"><Lock size={18} /><h3>Private by design</h3><p>Your vitals are processed locally. Sharing is always optional, explicit, and anonymised.</p></div>
          <div className="landing-pillar"><Activity size={18} /><h3>Patterns, not panic</h3><p>Personal baselines help surface meaningful drift before a single reading becomes a worry.</p></div>
          <div className="landing-pillar"><Smartphone size={18} /><h3>Ready offline</h3><p>Core scoring and cached guidance keep working when the network cannot.</p></div>
        </section>
      </main>

      <footer className="landing-footer"><span><Check size={13} color={T.safe} /> Built for calm, informed decisions</span><span>Prototype · Synthetic data</span></footer>
    </div>
  );
}

function Section({ title, icon, note, right, children }) {
  return (
    <div className="rk-card" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span className="disp" style={{ fontSize: 14.5, fontWeight: 600 }}>{title}</span>
          {note && <span style={{ fontSize: 11, color: T.textFaint }}>· {note}</span>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function VitalCard({ rule, value, level }) {
  const color = LEVEL_COLOR[level];
  const Icon = rule.Icon;
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${color}33`, background: T.surface2, padding: "12px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 9.5, color, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{LEVEL_LABEL[level]}</span>
      </div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{value.toFixed(0)}<span style={{ fontSize: 11, color: T.textFaint, marginLeft: 3 }}>{rule.unit}</span></div>
      <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 2 }}>{rule.label}</div>
    </div>
  );
}

function HazardCard({ meta, value, level }) {
  const color = LEVEL_COLOR[level];
  const Icon = meta.Icon;
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${color}33`, background: T.surface2, padding: "12px 13px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>{meta.label}</span>
        </div>
        <span style={{ fontSize: 9.5, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>{LEVEL_LABEL[level]}</span>
      </div>
      <div style={{ height: 5, borderRadius: 4, background: T.bgGrid, marginTop: 9, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, transition: "width .4s ease" }} />
      </div>
      <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 8, lineHeight: 1.4 }}>{meta.tip(level)}</div>
    </div>
  );
}

function RegionPicker({ region, setRegion }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.bgGrid, border: `1px solid ${T.borderSoft}`, borderRadius: 9, padding: "5px 9px" }}>
      <MapPin size={12} color={T.textFaint} />
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        style={{ background: "transparent", border: "none", color: T.text, fontSize: 11.5, outline: "none" }}
      >
        {Object.keys(REGIONS).map((r) => <option key={r} value={r} style={{ background: T.surface }}>{r}</option>)}
      </select>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
      {label}
    </span>
  );
}

function PrivacyRow({ title, desc, locked }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderSoft}` }}>
      <Lock size={14} color={T.accent2} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{title}</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, value, onChange, icon }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 0", alignItems: "flex-start" }}>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 34, height: 20, borderRadius: 99, flexShrink: 0, marginTop: 2, cursor: "pointer",
          border: `1px solid ${value ? T.accent : T.borderSoft}`, background: value ? `${T.accent}33` : T.bgGrid,
          position: "relative", transition: "all .2s ease",
        }}
      >
        <span style={{
          position: "absolute", top: 1, left: value ? 15 : 1, width: 16, height: 16, borderRadius: 99,
          background: value ? T.accent : T.textFaint, transition: "left .2s ease",
        }} />
      </button>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>{title} {icon}</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function ArchPoint({ text }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <Info size={13} color={T.textFaint} style={{ marginTop: 3, flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  );
}

function PulseWave({ color }) {
  return (
    <svg width="600" height="84" viewBox="0 0 600 84" fill="none">
      <path
        d="M0 42 H60 L75 42 L85 15 L100 68 L112 42 L130 42 L142 30 L152 42 H210
           L225 42 L235 15 L250 68 L262 42 L280 42 L292 30 L302 42 H360
           L375 42 L385 15 L400 68 L412 42 L430 42 L442 30 L452 42 H510
           L525 42 L535 15 L550 68 L562 42 L580 42 L592 30 L600 42"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
