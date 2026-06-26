import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dna, Activity, FlaskConical, Search, ChevronRight, Database } from "lucide-react";
import { getStats } from "../services/api";
import { StatCard, Spinner } from "../components/UI";

const FEATURES = [
  { icon: <Dna size={22} />,         color: "#1a6fc4", bg: "#dbeafe", title: "Allergen / Peptides", desc: "AlphaFold2 3D structures, immunogenicity, HLA-DQ binding and physicochemical properties.", link: "/peptides" },
  { icon: <Activity size={22} />,    color: "#0d7377", bg: "#ccfbf1", title: "GWAS Studies",        desc: "Genome-wide association studies with p-values, gene mappings and full study metadata.",   link: "/gwas" },
  { icon: <FlaskConical size={22} />, color: "#5b21b6", bg: "#ede9fe", title: "SNP Variants",        desc: "Curated SNPs with risk alleles, genotype effects and downloadable VCF files.",            link: "/snps" },
];

const QUICK = ["alpha-gliadin", "HLA-DQ2", "rs157640", "DOK5", "DQ8", "celiac"];

export default function HomePage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => { getStats().then(r => setStats(r.data)).catch(() => {}); }, []);

  const go = (e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <div style={{ background: "#f8fafc" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #e8f0fe 0%, #f0fdfa 50%, #f8fafc 100%)",
        borderBottom: "1px solid #e2e8f0",
        padding: "72px 24px 64px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Pill label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 18px", borderRadius: 999,
            background: "#fff", border: "1px solid #bfdbfe",
            fontSize: 12, color: "#1e40af", fontWeight: 600,
            letterSpacing: "0.04em", textTransform: "uppercase",
            boxShadow: "0 1px 4px rgba(26,111,196,.12)",
            marginBottom: 28,
          }}>
            <Database size={12} />Celiac Disease Research Database
          </div>

          {/* Main heading */}
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(38px, 6vw, 66px)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: 10,
            color: "#0f172a",
          }}>
            Celiac Research
          </h1>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(38px, 6vw, 66px)",
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: 24,
            background: "linear-gradient(135deg, #1a6fc4, #0d7377)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Portal
          </h1>

          <p style={{
            fontSize: 17, color: "#475569", maxWidth: 500,
            margin: "0 auto 36px", lineHeight: 1.75,
            fontWeight: 400,
          }}>
            Search and explore peptide allergens, GWAS studies, and SNP variants
            from your MongoDB database — all in one unified interface.
          </p>

          {/* Search bar */}
          <form onSubmit={go} style={{
            display: "flex", gap: 8, maxWidth: 540, margin: "0 auto",
            background: "#fff", border: "1px solid #bfdbfe",
            borderRadius: 12, padding: "7px 7px 7px 16px",
            boxShadow: "0 4px 20px rgba(26,111,196,.12)",
          }}>
            <Search size={17} color="#94a3b8" style={{ alignSelf: "center", flexShrink: 0 }} />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search peptides, genes, SNPs, diseases…"
              style={{
                flex: 1, background: "none", border: "none",
                fontSize: 14, padding: 0, boxShadow: "none", color: "#0f172a",
              }} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Search
            </button>
          </form>

          {/* Quick search pills */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
            {QUICK.map(t => (
              <button key={t} onClick={() => nav(`/search?q=${t}`)} style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 999, padding: "4px 14px",
                fontSize: 12, color: "#64748b", cursor: "pointer",
                transition: "all .15s", fontFamily: "JetBrains Mono, monospace",
                boxShadow: "0 1px 3px rgba(0,0,0,.06)",
              }}
                onMouseEnter={e => { e.target.style.borderColor = "#1a6fc4"; e.target.style.color = "#1a6fc4"; e.target.style.background = "#dbeafe"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#64748b"; e.target.style.background = "#fff"; }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 60px" }}>

        {/* Stats */}
        {stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 52 }}>
            <StatCard icon={<Dna size={22} />}          label="Peptides / Allergens" value={stats.peptides} color="#1a6fc4" />
            <StatCard icon={<Activity size={22} />}     label="GWAS Studies"         value={stats.gwas}     color="#0d7377" />
            <StatCard icon={<FlaskConical size={22} />} label="SNP Variants"         value={stats.snps}     color="#5b21b6" />
          </div>
        ) : <Spinner />}

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {FEATURES.map(({ icon, color, bg, title, desc, link }) => (
            <div key={title} className="card" style={{ cursor: "pointer" }} onClick={() => nav(link)}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: bg, display: "flex", alignItems: "center",
                justifyContent: "center", color, marginBottom: 16,
              }}>
                {icon}
              </div>
              <h3 style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 19, fontWeight: 700,
                color: "#0f172a", marginBottom: 8,
              }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, marginBottom: 16 }}>{desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color, fontSize: 13, fontWeight: 600 }}>
                Browse Database <ChevronRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
