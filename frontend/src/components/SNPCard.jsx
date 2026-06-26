import React from "react";
import { Link } from "react-router-dom";
import { FlaskConical, Download, FileCode, ExternalLink, Zap, GitBranch, AlertTriangle } from "lucide-react";
import { dlJSON, dlCSV, dlVCF } from "../components/UI";

export default function SNPCard({ snp }) {
  const { rs_id, chromosome, position, gene, alleles, risk_allele,
    genotype_effect, odds_ratio, p_value, summary, study_links, inheritance } = snp;

  return (
    <div className="card fade-up" style={{ display:"flex", flexDirection:"column", gap:13 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FlaskConical size={14} color="var(--purple)" />
          <span className="mono" style={{ fontSize:14, color:"var(--purple)", fontWeight:700 }}>{rs_id}</span>
        </div>
        {risk_allele && <span className="badge badge-red"><AlertTriangle size={10}/>Risk: {risk_allele}</span>}
      </div>

      {/* Tags */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
        {gene       && <span className="badge badge-cyan"><GitBranch size={10}/>{gene}</span>}
        {alleles    && <span className="badge badge-teal">{alleles}</span>}
        {chromosome && <span className="badge badge-purple">Chr {chromosome}{position&&position!=="N/A"?`:${position}`:""}</span>}
      </div>

      {/* Effect */}
      {genotype_effect && (
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:13, color:"var(--text2)", display:"flex", alignItems:"center", gap:8 }}>
          <Zap size={13} color="var(--amber)"/>{genotype_effect}
        </div>
      )}

      {summary && <p style={{ fontSize:13, color:"var(--text3)", fontStyle:"italic" }}>{summary}</p>}

      {/* Stats */}
      <div style={{ display:"flex", gap:14, fontSize:12, color:"var(--text3)" }}>
        {odds_ratio && odds_ratio!=="N/A" && <span>Odds Ratio: <b style={{ color:"var(--text2)" }}>{odds_ratio}</b></span>}
        {p_value    && p_value   !=="N/A" && <span>p: <b style={{ color:"var(--text2)" }}>{p_value}</b></span>}
        {inheritance&& inheritance!=="N/A" && <span>Mode: <b style={{ color:"var(--text2)" }}>{inheritance}</b></span>}
      </div>

      <div className="divider" />

      {/* Buttons */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
       <Link to={`/snps/${snp.rs_id}`} className="btn btn-primary" style={{ fontSize:12, padding:"6px 13px" }}>
  <ExternalLink size={13}/>Details
</Link>
        {study_links && (
          <a href={study_links.startsWith("http")?study_links:`https://${study_links}`}
            target="_blank" rel="noreferrer"
            className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
            <ExternalLink size={13}/>Study
          </a>
        )}
        <button onClick={()=>dlVCF([snp], `${rs_id}.vcf`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <Download size={13}/>VCF
        </button>
        <button onClick={()=>dlCSV([snp], `${rs_id}.csv`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <Download size={13}/>CSV
        </button>
        <button onClick={()=>dlJSON(snp, `${rs_id}.json`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <FileCode size={13}/>JSON
        </button>
      </div>
    </div>
  );
}
