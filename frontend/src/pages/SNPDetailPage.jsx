import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, ExternalLink, FlaskConical, Globe, Activity, BarChart2 } from "lucide-react";
import { getSNP } from "../services/api";
import { Spinner, DetailRow, dlJSON, dlCSV, dlVCF } from "../components/UI";

// Cohort config for new format
const COHORTS = [
  { label: "UK1",     flag: "🇬🇧", suffix: "UK1" },
  { label: "UK2",     flag: "🇬🇧", suffix: "UK2" },
  { label: "Finland", flag: "🇫🇮", suffix: "FIN" },
  { label: "Netherlands", flag: "🇳🇱", suffix: "NL" },
  { label: "Italy",   flag: "🇮🇹", suffix: "IT"  },
];

// Helper — show value or "—" if N/A / null / undefined
function val(v) {
  if (v === undefined || v === null || v === "N/A" || v === "") return "—";
  return v;
}

// Color for odds ratio
function orColor(or) {
  if (or === "N/A" || or === "—") return "var(--text3)";
  const n = parseFloat(or);
  if (n >= 10) return "var(--red)";
  if (n >= 7)  return "var(--orange, #f97316)";
  if (n >= 4)  return "var(--yellow, #eab308)";
  return "var(--cyan)";
}

// Detect format: new has cohort data fields
function isNewFormat(snp) {
  return snp && (
    snp.odds_ratio_UK1 !== undefined ||
    snp.gss_UK1 !== undefined ||
    snp.maf_snp1_UK1 !== undefined
  );
}

export default function SNPDetailPage() {
  const { rs_id } = useParams();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSNP(rs_id)
      .then(r => {
        console.log("✅ SNP loaded:", r.data);
        setS(r.data);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
      })
      .finally(() => setLoading(false));
  }, [rs_id]);

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!s) return (
    <div style={{ padding: 60, textAlign: "center", color: "var(--red)" }}>
      SNP not found
    </div>
  );

  const isNew = isNewFormat(s);

  // Display odds ratio badge for new format
  const displayOR = isNew ? COHORTS.reduce((found, c) => {
    if (found) return found;
    const v = s[`odds_ratio_${c.suffix}`];
    return (v && v !== "N/A") ? v : null;
  }, null) : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* ── Back link ── */}
      <Link
        to="/snps"
        style={{ display: "inline-flex", alignItems: "center", gap: 6,
          color: "var(--text3)", textDecoration: "none", fontSize: 13, marginBottom: 22 }}
      >
        <ArrowLeft size={13} /> Back to SNPs
      </Link>

      {/* ── Hero card ── */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border2)",
        borderRadius: 18, padding: 26, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
              <FlaskConical size={16} color="var(--purple)" />
              <span className="mono" style={{ color: "var(--purple)", fontSize: 16, fontWeight: 700 }}>
                {s.rs_id}
              </span>
              {isNew && s.rs_id_pair && (
                <span className="mono" style={{ color: "var(--text3)", fontSize: 13 }}>
                  ×&nbsp;{s.rs_id_pair}
                </span>
              )}
              {displayOR && (
                <span className="badge" style={{ background: "var(--red-muted, #fee2e2)", color: "var(--red)" }}>
                  OR {displayOR} (UK1)
                </span>
              )}
              {s.risk_allele && s.risk_allele !== "N/A" && (
                <span className="badge badge-red">Risk: {s.risk_allele}</span>
              )}
            </div>
            <h1 style={{ fontFamily: "DM Serif Display", fontSize: 22, color: "var(--text)" }}>
              {s.gene !== "N/A" ? s.gene : (s.region || "SNP")} — {s.genotype_effect || s.summary}
            </h1>
          </div>

          {/* Download buttons */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "flex-start" }}>
            <button className="btn btn-primary" onClick={() => dlVCF([s], `${s.rs_id}.vcf`)}>
              <Download size={14} /> VCF
            </button>
            <button className="btn btn-ghost" onClick={() => dlCSV([s], `${s.rs_id}.csv`)}>
              <Download size={14} /> CSV
            </button>
            <button className="btn btn-ghost" onClick={() => dlJSON(s, `${s.rs_id}.json`)}>
              <FileCode size={14} /> JSON
            </button>
            {s.study_links && (
              <a
                href={s.study_links.startsWith("http") ? s.study_links : `https://${s.study_links}`}
                target="_blank" rel="noreferrer" className="btn btn-ghost"
              >
                <ExternalLink size={14} /> Study
              </a>
            )}
          </div>
        </div>

        {s.summary && (
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
            {s.summary}
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          OLD FORMAT LAYOUT — Simple 2-column for old SNPs
          ═══════════════════════════════════════════════════════════════════════ */}
      {!isNew && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Variant Information */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 13, padding: 18 }}>
            <h3 style={{ color: "var(--purple)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Variant Information
            </h3>
            <DetailRow label="rs ID"         value={s.rs_id} mono />
            <DetailRow label="Chromosome"    value={val(s.chromosome)} />
            <DetailRow label="Position"      value={val(s.position)} />
            <DetailRow label="Gene"          value={val(s.gene)} />
            <DetailRow label="Alleles"       value={val(s.alleles)} mono />
            <DetailRow label="Risk Allele"   value={val(s.risk_allele)} mono />
            <DetailRow label="Inheritance"   value={val(s.inheritance)} />
          </div>

          {/* Clinical Effect */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 13, padding: 18 }}>
            <h3 style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Clinical Effect
            </h3>
            <DetailRow label="Genotype Effect"  value={val(s.genotype_effect)} />
            <DetailRow label="Odds Ratio"       value={val(s.odds_ratio)} />
            <DetailRow label="P-Value"          value={val(s.p_value)} />
            <DetailRow label="Inheritance"      value={val(s.inheritance)} />
            <DetailRow label="Population Data"  value={val(s.population_data)} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          NEW FORMAT LAYOUT — Full detail with cohorts for new SNPs
          ═══════════════════════════════════════════════════════════════════════ */}
      {isNew && (
        <>
          {/* Row 1: Variant info + Clinical effect */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Variant Information */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 13, padding: 18 }}>
              <SectionTitle color="var(--purple)" icon={<FlaskConical size={13} />}>
                Variant Information
              </SectionTitle>
              <DetailRow label="rs ID"            value={val(s.rs_id)} mono />
              <DetailRow label="Paired rs ID"     value={val(s.rs_id_pair)} mono />
              <DetailRow label="Chromosome"       value={val(s.chromosome)} />
              <DetailRow label="Position (SNP 1)" value={val(s.position)} />
              <DetailRow label="Position (SNP 2)" value={val(s.position_pair)} />
              <DetailRow label="Genome Build"     value={val(s.genome_build)} />
              <DetailRow label="Gene"             value={val(s.gene)} />
              <DetailRow label="Region"           value={val(s.region)} />
              <DetailRow label="Alleles"          value={val(s.alleles)} mono />
              <DetailRow label="Risk Allele"      value={val(s.risk_allele)} mono />
              <DetailRow label="Inheritance"      value={val(s.inheritance)} />
            </div>

            {/* Clinical / Study info */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 13, padding: 18 }}>
              <SectionTitle color="var(--cyan)" icon={<Activity size={13} />}>
                Clinical Effect
              </SectionTitle>
              <DetailRow label="Disease"            value={val(s.disease)} />
              <DetailRow label="Interaction Type"   value={val(s.interaction_type)} />
              <DetailRow label="Genotype Effect"    value={val(s.genotype_effect)} />
              <DetailRow label="Rank"               value={val(s.rank)} />
              <DetailRow label="Fisher p-value (−log₁₀)" value={val(s.p_value_fisher)} />
              <DetailRow label="Chi² SNP 1 (−log₁₀)"    value={val(s.chi2_snp1)} />
              <DetailRow label="Chi² SNP 2 (−log₁₀)"    value={val(s.chi2_snp2)} />
              <DetailRow label="Population Data"    value={val(s.population_data)} />
            </div>
          </div>

          {/* Row 2: Per-cohort stats table */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 13, padding: 18, marginBottom: 16 }}>
            <SectionTitle color="var(--green, #22c55e)" icon={<Globe size={13} />}>
              Per-Cohort Statistics
            </SectionTitle>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Cohort", "Odds Ratio", "GSS Score", "LRT (−log₁₀)", "AROC",
                      "MAF SNP1", "MAF SNP2"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 12px",
                        color: "var(--text3)", fontWeight: 600, fontSize: 11,
                        textTransform: "uppercase", letterSpacing: ".05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COHORTS.map((c, i) => {
                    const or   = val(s[`odds_ratio_${c.suffix}`]);
                    const gss  = val(s[`gss_${c.suffix}`]);
                    const lrt  = val(s[`lrt_${c.suffix}`]);
                    const aroc = val(s[`aroc_${c.suffix}`]);
                    const maf1 = val(s[`maf_snp1_${c.suffix}`]);
                    const maf2 = val(s[`maf_snp2_${c.suffix}`]);

                    return (
                      <tr key={c.suffix}
                        style={{ borderBottom: "1px solid var(--border)",
                          background: i % 2 === 0 ? "transparent" : "var(--bg-alt, rgba(255,255,255,0.02))" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text)" }}>
                          {c.flag} {c.label}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontWeight: 700, color: orColor(or), fontFamily: "monospace" }}>
                            {or}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", color: "var(--text2)", fontFamily: "monospace" }}>{gss}</td>
                        <td style={{ padding: "8px 12px", color: "var(--text2)", fontFamily: "monospace" }}>{lrt}</td>
                        <td style={{ padding: "8px 12px", color: "var(--text2)", fontFamily: "monospace" }}>{aroc}</td>
                        <td style={{ padding: "8px 12px", color: "var(--text2)", fontFamily: "monospace" }}>{maf1}</td>
                        <td style={{ padding: "8px 12px", color: "var(--text2)", fontFamily: "monospace" }}>{maf2}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>
              GSS = Adjusted −log₁₀(p-value) for epistatic interaction · LRT = Likelihood Ratio Test ·
              AROC = Area under ROC curve · MAF = Minor Allele Frequency ·
              "—" = not available for this cohort
            </p>
          </div>

          {/* Row 3: OR visual comparison */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 13, padding: 18 }}>
            <SectionTitle color="var(--orange, #f97316)" icon={<BarChart2 size={13} />}>
              Odds Ratio Across Cohorts
            </SectionTitle>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {COHORTS.map(c => {
                const or = s[`odds_ratio_${c.suffix}`];
                const num = (or && or !== "N/A") ? parseFloat(or) : null;
                const maxOR = Math.max(...COHORTS.map(x => {
                  const v = s[`odds_ratio_${x.suffix}`];
                  return (v && v !== "N/A") ? parseFloat(v) : 0;
                }));
                const pct = num ? Math.round((num / maxOR) * 100) : 0;

                return (
                  <div key={c.suffix} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 100, fontSize: 12, color: "var(--text2)", flexShrink: 0 }}>
                      {c.flag} {c.label}
                    </span>
                    <div style={{ flex: 1, background: "var(--border)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div style={{
                        width: num ? `${pct}%` : "0%",
                        height: "100%",
                        background: num ? orColor(num) : "var(--border)",
                        borderRadius: 4,
                        transition: "width 0.6s ease"
                      }} />
                    </div>
                    <span className="mono" style={{ width: 44, fontSize: 12,
                      color: num ? orColor(num) : "var(--text3)", textAlign: "right", fontWeight: 600 }}>
                      {num ? num.toFixed(2) : "N/A"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// ── Small reusable section title ──
function SectionTitle({ color, icon, children }) {
  return (
    <h3 style={{ color, fontSize: 12, fontWeight: 600, marginBottom: 12,
      textTransform: "uppercase", letterSpacing: ".06em",
      display: "flex", alignItems: "center", gap: 5 }}>
      {icon}{children}
    </h3>
  );
}
