import React from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

export function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:48 }}>
      <div className="spinner" />
    </div>
  );
}

export function Empty({ msg = "No results found" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"60px 20px", color:"var(--text3)" }}>
      <AlertCircle size={36} />
      <p style={{ fontSize:15 }}>{msg}</p>
    </div>
  );
}

export function Pagination({ page, limit, total, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:32 }}>
      <button className="btn btn-ghost" onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ padding:"6px 10px", opacity: page===1 ? .4:1 }}>
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = pages <= 7 ? i+1 : page <= 4 ? i+1 : page >= pages-3 ? pages-6+i : page-3+i;
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            width:36, height:36, border:"1px solid",
            borderColor: p===page ? "var(--cyan)":"var(--border)",
            background: p===page ? "rgba(99,179,237,.15)":"transparent",
            color: p===page ? "var(--cyan)":"var(--text2)",
            borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
          }}>{p}</button>
        );
      })}
      <button className="btn btn-ghost" onClick={() => onChange(page + 1)} disabled={page === pages}
        style={{ padding:"6px 10px", opacity: page===pages ? .4:1 }}>
        <ChevronRight size={16} />
      </button>
      <span style={{ fontSize:12, color:"var(--text3)", marginLeft:6 }}>{total.toLocaleString()} total</span>
    </div>
  );
}

export function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign:"center" }}>
      <div style={{ color, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:30, fontWeight:700, fontFamily:"DM Mono", color }}>{(value||0).toLocaleString()}</div>
      <div style={{ fontSize:13, color:"var(--text3)", marginTop:4 }}>{label}</div>
    </div>
  );
}

export function DetailRow({ label, value, mono=false }) {
  if (value === undefined || value === null || value === "" || value === "Unknown" || value === "N/A") return null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"170px 1fr", gap:12, padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
      <span style={{ color:"var(--text3)", fontWeight:500 }}>{label}</span>
      <span style={{ color:"var(--text)", fontFamily: mono?"DM Mono":"Outfit", wordBreak:"break-all" }}>{String(value)}</span>
    </div>
  );
}

export function SectionHead({ title, count, color="var(--cyan)" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
      <h2 style={{ fontFamily:"DM Serif Display", fontSize:24, color:"var(--text)" }}>{title}</h2>
      {count !== undefined && <span className="badge badge-cyan">{count.toLocaleString()}</span>}
    </div>
  );
}

// Download helpers — exported so any card can use them
export function dlJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  dl(URL.createObjectURL(blob), filename);
}

export function dlCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]).filter(k => k !== "_id" && k !== "pdb_structure");
  const csv  = [keys.join(","), ...rows.map(r => keys.map(k => `"${String(r[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  dl(URL.createObjectURL(blob), filename);
}

export function dlVCF(rows, filename) {
  const lines = [
    "##fileformat=VCFv4.2", "##source=CeliacDB",
    "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO",
    ...rows.map(s =>
      `${s.chromosome??"."}\t${s.position??"."}\t${s.rs_id??"."}\t` +
      `${s.alleles?.split("/")?.[0]??"."}\t${s.alleles?.split("/")?.[1]??"."}\t` +
      `.\tPASS\tGENE=${s.gene??"."};EFFECT=${s.genotype_effect??"."}`
    ),
  ].join("\n");
  dl(URL.createObjectURL(new Blob([lines],{type:"text/plain"})), filename);
}

export function dlFASTA(peptide) {
  const txt = `>${peptide.Peptide_Id} ${peptide.Peptide_Description||""}\n${peptide.Peptide_sequence||""}`;
  dl(URL.createObjectURL(new Blob([txt],{type:"text/plain"})), `${peptide.Peptide_Id}.fasta`);
}

function dl(url, name) {
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); document.body.removeChild(a);
}
