import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, ExternalLink, Activity } from "lucide-react";
import { getGWASEntry } from "../services/api";
import { Spinner, DetailRow, dlJSON, dlCSV } from "../components/UI";

export default function GWASDetailPage() {
  const { id } = useParams();
  const [g, setG] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGWASEntry(id)
      .then((r) => setG(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 60 }}><Spinner /></div>;
  if (!g) return <div style={{ padding: 60, textAlign: "center", color: "var(--red)" }}>Entry not found</div>;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 60px" }}>

      <Link
        to="/gwas"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text3)",
          textDecoration: "none",
          fontSize: 13,
          marginBottom: 22,
        }}
      >
        <ArrowLeft size={13} /> Back to GWAS
      </Link>

      {/* ── Header Card ── */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border2)",
          borderRadius: 18,
          padding: 26,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <Activity size={16} color="var(--teal)" />
              <span className="mono" style={{ color: "var(--teal)", fontSize: 15, fontWeight: 700 }}>
                {g.SNPS}
              </span>
              {g["STRONGEST SNP-RISK ALLELE"] && (
                <span className="badge badge-amber">{g["STRONGEST SNP-RISK ALLELE"]}</span>
              )}
            </div>
            <h1 style={{ fontFamily: "DM Serif Display", fontSize: 22, color: "var(--text)" }}>
              {g["DISEASE/TRAIT"] || g.MAPPED_TRAIT}
            </h1>
          </div>

          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "flex-start" }}>
            {g.PUBMEDID && ( <a href={`https://pubmed.ncbi.nlm.nih.gov/${g.PUBMEDID}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary" >
                <ExternalLink size={14} /> PubMed
              </a>
            )}
            <button className="btn btn-ghost" onClick={() => dlCSV([g], `GWAS_${g.SNPS || id}.csv`)}>
              <Download size={14} /> CSV
            </button>
            <button className="btn btn-ghost" onClick={() => dlJSON(g, `GWAS_${g.SNPS || id}.json`)}>
              <FileCode size={14} /> JSON
            </button>
          </div>
        </div>

        {g.STUDY && (
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{g.STUDY}</p>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Study Info */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3
            style={{
              color: "var(--teal)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Study Information
          </h3>
          <DetailRow label="First Author"   value={g.FIRST_AUTHOR} />
          <DetailRow label="Journal"        value={g.JOURNAL} />
          <DetailRow label="Date"           value={g.DATE ? new Date(g.DATE).toLocaleDateString() : null} />
          <DetailRow label="Accession"      value={g.STUDY_ACCESSION} mono />
          <DetailRow label="Initial Sample" value={g.INITIAL_SAMPLE_SIZE} />
          <DetailRow label="Platform"       value={g["PLATFORM [SNPS PASSING QC]"]} />
          <DetailRow label="Technology"     value={g.GENOTYPING_TECHNOLOGY} />
        </div>

        {/* Genetic Location */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3
            style={{
              color: "var(--cyan)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Genetic Location
          </h3>
          <DetailRow label="Region"          value={g.REGION} />
          <DetailRow label="Chromosome"      value={g.CHR_ID} />
          <DetailRow label="Position"        value={g.CHR_POS?.toLocaleString?.()} />
          <DetailRow label="Reported Gene"   value={g["REPORTED GENE(S)"]} />
          <DetailRow label="Mapped Gene"     value={g.MAPPED_GENE} />
          <DetailRow label="Upstream Gene"   value={g.UPSTREAM_GENE_ID} mono />
          <DetailRow label="Downstream Gene" value={g.DOWNSTREAM_GENE_ID} mono />
          <DetailRow label="Context"         value={g.CONTEXT} />
        </div>

        {/* Statistics */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3
            style={{
              color: "var(--purple)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            GWAS Statistics
          </h3>
          <DetailRow label="P-Value"          value={g["P-VALUE"]} />
          <DetailRow label="P-Value (mlog)"   value={g.PVALUE_MLOG} />
          <DetailRow label="Risk Allele Freq" value={g["RISK ALLELE FREQUENCY"]} />
          <DetailRow label="SNP ID"           value={g.SNP_ID_CURRENT} mono />
          <DetailRow label="CNV"              value={g.CNV} />
        </div>

        {/* Disease Mapping */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 18 }}>
          <h3
            style={{
              color: "var(--amber)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Disease Mapping
          </h3>
          <DetailRow label="Mapped Trait"  value={g.MAPPED_TRAIT} />
          
          <DetailRow label="Disease/Trait" value={g["DISEASE/TRAIT"]} />
          <DetailRow label="PUBMED ID" value={g["PUBMEDID"]} />
          {g.LINK && (
            <div style={{ marginTop: 12 }}>
              
               <a href={g.LINK.startsWith("http") ? g.LINK : `https://${g.LINK}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--cyan)",
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={13} /> View Study →
              </a>
              {g.MAPPED_TRAIT_URI && (
            <div style={{ marginTop: 12 }}>
              

                 <a  href={
                  g.MAPPED_TRAIT_URI.trim().startsWith("http")
                  ? g.MAPPED_TRAIT_URI.trim()
                  : `https://${g.MAPPED_TRAIT_URI.trim()}`
                    }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--cyan)",
                  fontSize: 13,
                  textDecoration: "none",
                   }}
              >
                 
                  <ExternalLink size={13} /> View Mapped Trait →
                </a>
              </div>  
                
            ) }
            </div>
          )}
        
          
           
        </div>

      </div>
    </div>
  );
}