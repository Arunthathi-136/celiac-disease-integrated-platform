import React, { useEffect, useState, useCallback } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import { getGWAS } from "../services/api";
import { dlCSV, dlJSON } from "../components/UI";
import GWASCard from "../components/GWASCard";
import { Spinner, Empty, Pagination, SectionHead } from "../components/UI";

export default function GWASPage() {
  const [data, setData]   = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);
  const [q, setQ]         = useState("");
  const [gene, setGene]   = useState("");
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getGWAS({ q, gene, page, limit:LIMIT });
      setData(r.data.data); setTotal(r.data.total);
    } catch { setData([]); } finally { setLoading(false); }
  }, [q, gene, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, gene]);

  const bulk = async (type) => {
    const r = await getGWAS({ q, gene, page:1, limit:10000 });
    type==="csv" ? dlCSV(r.data.data,"gwas_export.csv") : dlJSON(r.data.data,"gwas_export.json");
  };

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px 60px" }}>
      <SectionHead title="GWAS Studies" count={total}/>

      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:22, display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:9, padding:"8px 12px", flex:"1 1 200px" }}>
          <Search size={13} color="var(--text3)"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search studies, genes, SNPs…"
            style={{ background:"none", border:"none", fontSize:13, padding:0 }}/>
        </div>
        <input value={gene} onChange={e=>setGene(e.target.value)} placeholder="Filter by gene…"
          style={{ flex:"1 1 150px", fontSize:13 }}/>
        <button className="btn btn-ghost" onClick={()=>{setQ("");setGene("");}} style={{ fontSize:12, padding:"8px 12px" }}>
          <RefreshCw size={13}/>Reset
        </button>
        <button className="btn btn-ghost" onClick={()=>bulk("csv")} style={{ fontSize:12, padding:"8px 12px" }}>
          <Download size={13}/>Export CSV
        </button>
        <button className="btn btn-ghost" onClick={()=>bulk("json")} style={{ fontSize:12, padding:"8px 12px" }}>
          <Download size={13}/>Export JSON
        </button>
      </div>

      {loading ? <Spinner/> : data.length===0 ? <Empty/> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:18 }}>
          {data.map(g=><GWASCard key={g._id} entry={g}/>)}
        </div>
      )}
      <Pagination page={page} limit={LIMIT} total={total} onChange={setPage}/>
    </div>
  );
}
