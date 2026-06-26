import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Dna, Activity, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react";
import { globalSearch } from "../services/api";
import PeptideCard from "../components/PeptideCard";
import GWASCard from "../components/GWASCard";
import SNPCard from "../components/SNPCard";
import { Spinner, Empty } from "../components/UI";

export default function SearchPage() {
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const [res, setRes] = useState({ peptides: [], gwas: [], snps: [], total: { peptides: 0, gwas: 0, snps: 0 } });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  useEffect(() => { setPage(1); }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    globalSearch(q, page, LIMIT)
      .then(r => setRes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, page]);

  const total = (res.total?.peptides || 0) + (res.total?.gwas || 0) + (res.total?.snps || 0);
  const hasResults = res.peptides.length > 0 || res.gwas.length > 0 || res.snps.length > 0;
  const maxPages = Math.ceil(
    Math.max(res.total?.peptides || 0, res.total?.gwas || 0, res.total?.snps || 0) / LIMIT
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Search size={20} color="#1a6fc4" />
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, color: "#0f172a" }}>Search Results</h1>
        </div>
        <p style={{ color: "#475569", fontSize: 14 }}>
          Query: <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#1a6fc4", fontWeight: 600 }}>"{q}"</span>
          {!loading && <span style={{ marginLeft: 12, color: "#94a3b8" }}>— {total.toLocaleString()} result{total !== 1 ? "s" : ""} across all databases</span>}
        </p>
      </div>

      {loading ? <Spinner /> : !hasResults ? <Empty msg={`No results found for "${q}"`} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>

          {res.peptides.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Dna size={17} color="#1a6fc4" />
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, color: "#0f172a" }}>Allergen / Peptides</h2>
                  <span className="badge badge-cyan">{(res.total?.peptides || res.peptides.length).toLocaleString()}</span>
                </div>
                <Link to={`/peptides?q=${encodeURIComponent(q)}`} style={{ fontSize: 13, color: "#1a6fc4", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 18 }}>
                {res.peptides.map(p => <PeptideCard key={p._id} peptide={p} />)}
              </div>
            </section>
          )}

          {res.gwas.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Activity size={17} color="#0d7377" />
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, color: "#0f172a" }}>GWAS Studies</h2>
                  <span className="badge badge-teal">{(res.total?.gwas || res.gwas.length).toLocaleString()}</span>
                </div>
                <Link to={`/gwas?q=${encodeURIComponent(q)}`} style={{ fontSize: 13, color: "#0d7377", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 18 }}>
                {res.gwas.map(g => <GWASCard key={g._id} entry={g} />)}
              </div>
            </section>
          )}

          {res.snps.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FlaskConical size={17} color="#5b21b6" />
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, color: "#0f172a" }}>SNP Variants</h2>
                  <span className="badge badge-purple">{(res.total?.snps || res.snps.length).toLocaleString()}</span>
                </div>
                <Link to={`/snps?q=${encodeURIComponent(q)}`} style={{ fontSize: 13, color: "#5b21b6", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 18 }}>
                {res.snps.map(s => <SNPCard key={s._id} snp={s} />)}
              </div>
            </section>
          )}

          {maxPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1} style={{ padding: "6px 10px", opacity: page === 1 ? .4 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(maxPages, 7) }, (_, i) => {
                const p = maxPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= maxPages - 3 ? maxPages - 6 + i : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 36, height: 36, border: "1px solid",
                    borderColor: p === page ? "#1a6fc4" : "#e2e8f0",
                    background: p === page ? "#dbeafe" : "#fff",
                    color: p === page ? "#1e40af" : "#475569",
                    borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  }}>{p}</button>
                );
              })}
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(maxPages, p + 1))}
                disabled={page === maxPages} style={{ padding: "6px 10px", opacity: page === maxPages ? .4 : 1 }}>
                <ChevronRight size={16} />
              </button>
              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 6 }}>Page {page} of {maxPages}</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
