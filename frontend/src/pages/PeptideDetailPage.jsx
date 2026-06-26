import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, ExternalLink, Dna, CheckCircle, XCircle, Eye, RotateCcw } from "lucide-react";
import { getPeptide } from "../services/api";
import { Spinner, DetailRow, dlJSON, dlFASTA } from "../components/UI";

// ── 3D Viewer using 3Dmol.js loaded from CDN ─────────────────────────────────
function StructureViewer({ pdbData, peptideId }) {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [style, setStyle] = useState("cartoon");
  const [loaded, setLoaded] = useState(false);

  const load3Dmol = () => {
    return new Promise((resolve) => {
      if (window.$3Dmol) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.0.3/3Dmol-min.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const renderViewer = async (styleType) => {
    await load3Dmol();
    if (!viewerRef.current || !pdbData) return;
    if (viewerInstance.current) viewerInstance.current.clear();

    const viewer = window.$3Dmol.createViewer(viewerRef.current, {
      backgroundColor: "#111827",
    });
    viewerInstance.current = viewer;

    viewer.addModel(pdbData, "pdb");

    if (styleType === "cartoon") {
      viewer.setStyle({}, { cartoon: { colorscheme: "spectrum" } });
    } else if (styleType === "stick") {
      viewer.setStyle({}, { stick: { colorscheme: "rasmol" } });
    } else if (styleType === "sphere") {
      viewer.setStyle({}, { sphere: { colorscheme: "rasmol", radius: 0.6 } });
    } else if (styleType === "surface") {
      viewer.setStyle({}, { cartoon: { colorscheme: "spectrum" } });
      viewer.addSurface(window.$3Dmol.SurfaceType.VDW, {
        opacity: 0.6, colorscheme: "whiteCarbon",
      });
    }

    viewer.zoomTo();
    viewer.render();
    setLoaded(true);
  };

  useEffect(() => {
    if (pdbData) renderViewer(style);
    // eslint-disable-next-line
  }, [pdbData]);

  const changeStyle = (s) => {
    setStyle(s);
    renderViewer(s);
  };

  const STYLES = ["cartoon", "stick", "sphere", "surface"];

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
      {/* Viewer toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eye size={15} color="var(--cyan)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>3D Structure Viewer</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>— drag to rotate · scroll to zoom · right-drag to pan</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {STYLES.map(s => (
            <button key={s} onClick={() => changeStyle(s)}
              style={{
                padding: "4px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                borderColor: style === s ? "var(--cyan)" : "var(--border)",
                background: style === s ? "rgba(99,179,237,.15)" : "transparent",
                color: style === s ? "var(--cyan)" : "var(--text3)",
                textTransform: "capitalize",
              }}>{s}</button>
          ))}
          <button onClick={() => { if (viewerInstance.current) { viewerInstance.current.zoomTo(); viewerInstance.current.render(); } }}
            style={{ padding: "4px 10px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "1px solid var(--border)", background: "transparent", color: "var(--text3)" }}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* 3Dmol container */}
      <div style={{ position: "relative" }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111827", zIndex: 2 }}>
            <div style={{ textAlign: "center", color: "var(--text3)" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13 }}>Loading 3D structure…</p>
            </div>
          </div>
        )}
        <div ref={viewerRef} style={{ width: "100%", height: 420 }} />
      </div>
    </div>
  );
}

// ── Main Detail Page ──────────────────────────────────────────────────────────
export default function PeptideDetailPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPeptide(id).then(r => setP(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!p) return <div style={{ padding: 60, textAlign: "center", color: "var(--red)" }}>Peptide not found</div>;

  // Download PDB directly from the pdb_structure field stored in MongoDB
  const dlPDB = () => {
    if (!p.pdb_structure) { alert("PDB structure data not found in database."); return; }
    const blob = new Blob([p.pdb_structure], { type: "chemical/x-pdb" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = p.pdb_filename || `${p.Peptide_Id}.pdb`;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 60px" }}>
      <Link to="/peptides" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text3)", textDecoration: "none", fontSize: 13, marginBottom: 22 }}>
        <ArrowLeft size={13} />Back to Peptides
      </Link>

      {/* Header */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 18, padding: 26, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <Dna size={16} color="var(--cyan)" />
              <span className="mono" style={{ color: "var(--cyan)", fontSize: 15, fontWeight: 700 }}>{p.Peptide_Id}</span>
            </div>
            <h1 style={{ fontFamily: "DM Serif Display", fontSize: 24, color: "var(--text)" }}>
              {p.Peptide_Description || p.Peptide_Type}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "flex-start" }}>
            {p.structure_available && (
              <button className="btn btn-primary" onClick={dlPDB}>
                <Download size={14} />Download PDB
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => dlFASTA(p)}>
              <Download size={14} />FASTA
            </button>
            <button className="btn btn-ghost" onClick={() => dlJSON(p, `${p.Peptide_Id}.json`)}>
              <FileCode size={14} />JSON
            </button>
            {p.Pubmed_id && (
              <a href={p.Study_link || `https://pubmed.ncbi.nlm.nih.gov/${p.Pubmed_id}`}
                target="_blank" rel="noreferrer" className="btn btn-ghost">
                <ExternalLink size={14} />PubMed
              </a>
            )}
          </div>
        </div>

        {/* Sequence */}
        {p.Peptide_sequence && (
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Sequence ({p.length} aa)
            </div>
            <span className="mono" style={{ fontSize: 13, color: "var(--cyan2)", letterSpacing: ".1em", wordBreak: "break-all" }}>
              {p.Peptide_sequence}
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {p.structure_available
            ? <><CheckCircle size={15} color="var(--green)" /><span style={{ fontSize: 13, color: "var(--green)" }}>3D Structure available — {p.pdb_filename}</span></>
            : <><XCircle size={15} color="var(--text3)" /><span style={{ fontSize: 13, color: "var(--text3)" }}>3D Structure not accurately modeled in AlphaFold2</span></>}
        </div>
      </div>

      {/* 3D Viewer — only shown if structure is available */}
      {p.structure_available && p.pdb_structure && (
        <StructureViewer pdbData={p.pdb_structure} peptideId={p.Peptide_Id} />
      )}

      {/* Detail grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "var(--cyan)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Classification</h3>
          <DetailRow label="Protein Name"    value={p.Protein_name} />
          <DetailRow label="Peptide Type"   value={p.Peptide_Type} />
          <DetailRow label="Peptide Form"   value={p.PeptideForm} />
          <DetailRow label="HLA-DQ"         value={p["HLA-DQ"]} />
          <DetailRow label="Toxicity"       value={p.Toxicity} />
          <DetailRow label="Stability"      value={p.stability} />
          <DetailRow label="Celiac Association"  value={p.Celiac_association} />
          <DetailRow label="Disease/Trait"  value={p.Disease_Trait} />
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "var(--teal)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Alphafold2 Prediction Scores</h3>
          <DetailRow label="pLDDT Rank 1"     value={p.pLDDT_rank1} />
          <DetailRow label="pTM Rank 1"       value={p.pTM_rank1} />
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "var(--teal)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Physiochemical Properties</h3>
          <DetailRow label="Molecular Weight (Da)" value={p.Molecular_weight} />
          <DetailRow label="PI Value"         value={p.PI_value} />
          <DetailRow label="Aromaticity"      value={p.aromaticity} />
          <DetailRow label="Aliphatic Index"  value={p.Aliphatic_index} />
          <DetailRow label="Length "      value={p.length} />
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "var(--purple)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Source </h3>
          <DetailRow label="UniProt ID"      value={p.uniprot_id} />
          <DetailRow label="Source Organism" value={p["Source organism"] || p.Source_organism} />
          <DetailRow label="Chromosome"      value={p.Chromosome} />
          <DetailRow label="Gene Locus"      value={p.gene_locus} />
          <DetailRow label="IEDB ID(Immune Epitope Database)"         value={p.iedbid} />
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3 style={{ color: "var(--amber)", fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>References</h3>
          <DetailRow label="PubMed ID" value={p.Pubmed_id} />
          {p.Study_link && (
            <div style={{ marginTop: 12 }}>
              <a href={p.Study_link.startsWith("http") ? p.Study_link : `https://${p.Study_link}`}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--cyan)", fontSize: 13, textDecoration: "none" }}>
                <ExternalLink size={13} />View Study →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
