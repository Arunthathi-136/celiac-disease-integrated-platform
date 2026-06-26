import React from "react";
import { Link } from "react-router-dom";
import { Activity, Download, FileCode, ExternalLink, MapPin, BarChart2 } from "lucide-react";
import { dlJSON, dlCSV } from "../components/UI";

export default function GWASCard({ entry }) {
  const { _id, STUDY, "DISEASE/TRAIT":trait, MAPPED_GENE, SNPS,
    "STRONGEST SNP-RISK ALLELE":riskAllele, REGION, "P-VALUE":pval,
    FIRST_AUTHOR, JOURNAL, PUBMEDID, CHR_ID, CHR_POS, MAPPED_TRAIT,
    INITIAL_SAMPLE_SIZE } = entry;

  return (
    <div className="card fade-up" style={{ display:"flex", flexDirection:"column", gap:13 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Activity size={14} color="var(--teal)" />
          <span className="mono" style={{ fontSize:13, color:"var(--teal)", fontWeight:600 }}>{SNPS||"—"}</span>
          {riskAllele && <span className="badge badge-amber">{riskAllele}</span>}
        </div>
        {pval && (
          <span className={`badge ${pval<0.000001?"badge-red":pval<0.00001?"badge-amber":"badge-green"}`}>
            <BarChart2 size={10}/>p={typeof pval==="number"?pval.toExponential(2):pval}
          </span>
        )}
      </div>

      {/* Study title */}
      {STUDY && <p style={{ fontSize:13, color:"var(--text)", lineHeight:1.5 }}>{STUDY.length>110?STUDY.slice(0,110)+"…":STUDY}</p>}

      {/* Badges */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {trait       && <span className="badge badge-red">{trait}</span>}
        {MAPPED_TRAIT&& MAPPED_TRAIT!==trait && <span className="badge badge-teal">{MAPPED_TRAIT}</span>}
        {MAPPED_GENE && <span className="badge badge-cyan">{MAPPED_GENE}</span>}
      </div>

      {/* Location */}
      <div style={{ display:"flex", gap:14, fontSize:12, color:"var(--text3)", flexWrap:"wrap" }}>
        {REGION    && <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/>Region: {REGION}</span>}
        {CHR_ID    && <span>Chr {CHR_ID}{CHR_POS?`:${Number(CHR_POS).toLocaleString()}`:""}</span>}
        {FIRST_AUTHOR && <span>{FIRST_AUTHOR} · {JOURNAL}</span>}
      </div>

      {INITIAL_SAMPLE_SIZE && (
        <p style={{ fontSize:12, color:"var(--text3)" }}>
          <b style={{ color:"var(--text2)" }}>Sample: </b>{INITIAL_SAMPLE_SIZE}
        </p>
      )}

      <div className="divider" />

      {/* Buttons */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
        <Link to={`/gwas/${_id}`} className="btn btn-primary" style={{ fontSize:12, padding:"6px 13px" }}>
          <ExternalLink size={13}/>Details
        </Link>
        {PUBMEDID && (
          <a href={`https://pubmed.ncbi.nlm.nih.gov/${PUBMEDID}`} target="_blank" rel="noreferrer"
            className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
            <ExternalLink size={13}/>PubMed
          </a>
        )}
        <button onClick={()=>dlCSV([entry], `GWAS_${SNPS||_id}.csv`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <Download size={13}/>CSV
        </button>
        <button onClick={()=>dlJSON(entry, `GWAS_${SNPS||_id}.json`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <FileCode size={13}/>JSON
        </button>
      </div>
    </div>
  );
}
