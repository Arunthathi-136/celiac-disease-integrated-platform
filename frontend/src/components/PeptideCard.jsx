import React from "react";
import { Link } from "react-router-dom";
import { Dna, Download, FileCode, ExternalLink, Shield, Thermometer, Atom, Ruler } from "lucide-react";
import { dlJSON, dlFASTA } from "../components/UI";
import { getPeptideStructureUrl } from "../services/api";
function toxClass(t="") {
  const v = t.toLowerCase();
  if (v.includes("immuno") || v.includes("toxic")) return "badge-red";
  if (v.includes("non")) return "badge-green";
  return "badge-amber";
}

export default function PeptideCard({ peptide }) {
  const { Peptide_Id, Peptide_sequence, Peptide_Type, Peptide_Description,
    Toxicity, stability, "HLA-DQ":hla, Molecular_weight, Celiac_association,
    length, structure_available, pdb_filename } = peptide;

  const dlPDB = (e) => {
    e.preventDefault();
    const a = document.createElement("a");
    a.href = getPeptideStructureUrl(Peptide_Id);
    a.download = pdb_filename || `${Peptide_Id}.pdb`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="card fade-up" style={{ display:"flex", flexDirection:"column", gap:13 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
            <Dna size={14} color="var(--cyan)" />
            <span className="mono" style={{ fontSize:13, color:"var(--cyan)", fontWeight:600 }}>{Peptide_Id}</span>
          </div>
          <p style={{ fontSize:13, color:"var(--text)", fontWeight:500, lineHeight:1.4 }}>
            {Peptide_Description || Peptide_Type || "—"}
          </p>
        </div>
        {hla && <span className="badge badge-cyan">{hla}</span>}
      </div>

      {/* Sequence */}
      {Peptide_sequence && (
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px" }}>
          <span className="mono" style={{ fontSize:11, color:"var(--cyan2)", letterSpacing:".08em", wordBreak:"break-all" }}>
            {Peptide_sequence}
          </span>
        </div>
      )}

      {/* Badges */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {Toxicity  && <span className={`badge ${toxClass(Toxicity)}`}><Shield size={10}/>{Toxicity}</span>}
        {stability && <span className={`badge ${stability.toLowerCase().includes("unstable")?"badge-amber":"badge-green"}`}><Thermometer size={10}/>{stability}</span>}
        {Peptide_Type && <span className="badge badge-purple">{Peptide_Type}</span>}
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:14, fontSize:12, color:"var(--text3)" }}>
        {length          && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Ruler size={11}/>{length} aa</span>}
        {Molecular_weight&& <span style={{ display:"flex", alignItems:"center", gap:4 }}><Atom size={11}/>{Molecular_weight} Da</span>}
      </div>

      {Celiac_association && (
        <p style={{ fontSize:12, color:"var(--text3)", fontStyle:"italic" }}>{Celiac_association}</p>
      )}

      <div className="divider" />

      {/* Action buttons */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
        <Link to={`/peptides/${Peptide_Id}`} className="btn btn-primary" style={{ fontSize:12, padding:"6px 13px" }}>
          <ExternalLink size={13}/>Details
        </Link>
        {structure_available && (
          <button onClick={dlPDB} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
            <Download size={13}/>PDB
          </button>
        )}
        <button onClick={()=>dlFASTA(peptide)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <Download size={13}/>FASTA
        </button>
        <button onClick={()=>dlJSON(peptide, `${Peptide_Id}.json`)} className="btn btn-ghost" style={{ fontSize:12, padding:"6px 13px" }}>
          <FileCode size={13}/>JSON
        </button>
      </div>
    </div>
  );
}
