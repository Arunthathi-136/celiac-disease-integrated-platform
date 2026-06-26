import React, { useEffect, useState, useCallback } from "react";
import { Search, Download, RefreshCw, Filter } from "lucide-react";
import { getPeptides, getPeptideFilterOpts } from "../services/api";
import { dlCSV, dlJSON } from "../components/UI";
import PeptideCard from "../components/PeptideCard";
import { Spinner, Empty, Pagination, SectionHead } from "../components/UI";

export default function PeptidesPage() {
  const [data, setData]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [opts, setOpts]     = useState({ types:[], hlas:[], toxicities:[] });
  const [f, setF]           = useState({ type:"", hla:"", toxicity:"" });
  const LIMIT = 12;

  useEffect(() => { getPeptideFilterOpts().then(r=>setOpts(r.data)).catch(()=>{}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getPeptides({ q, ...f, page, limit:LIMIT });
      setData(r.data.data); setTotal(r.data.total);
    } catch { setData([]); } finally { setLoading(false); }
  }, [q, f, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, f]);

  const bulkAll = async (type) => {
    const r = await getPeptides({ q, ...f, page:1, limit:10000 });
    type==="csv" ? dlCSV(r.data.data, "peptides_export.csv") : dlJSON(r.data.data, "peptides_export.json");
  };

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px 60px" }}>
      <SectionHead title="Allergen / Peptide Database" count={total} />

      {/* Controls */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:22, display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:9, padding:"8px 12px", flex:"1 1 200px" }}>
          <Search size={13} color="var(--text3)"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search peptides…"
            style={{ background:"none", border:"none", fontSize:13, padding:0 }} />
        </div>

        <Filter size={14} color="var(--text3)" style={{ flexShrink:0 }} />

        <select value={f.type} onChange={e=>setF({...f,type:e.target.value})} style={{ flex:"1 1 150px", fontSize:13 }}>
          <option value="">All Types</option>
          {opts.types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select value={f.hla} onChange={e=>setF({...f,hla:e.target.value})} style={{ flex:"1 1 120px", fontSize:13 }}>
          <option value="">All HLA-DQ</option>
          {opts.hlas.map(h=><option key={h} value={h}>{h}</option>)}
        </select>
        <select value={f.toxicity} onChange={e=>setF({...f,toxicity:e.target.value})} style={{ flex:"1 1 140px", fontSize:13 }}>
          <option value="">All Toxicity</option>
          {opts.toxicities.map(t=><option key={t} value={t}>{t}</option>)}
        </select>

        <button className="btn btn-ghost" onClick={()=>{setQ("");setF({type:"",hla:"",toxicity:""}); }} style={{ fontSize:12, padding:"8px 12px" }}>
          <RefreshCw size={13}/>Reset
        </button>
        <button className="btn btn-ghost" onClick={()=>bulkAll("csv")} style={{ fontSize:12, padding:"8px 12px" }}>
          <Download size={13}/>Export CSV
        </button>
        <button className="btn btn-ghost" onClick={()=>bulkAll("json")} style={{ fontSize:12, padding:"8px 12px" }}>
          <Download size={13}/>Export JSON
        </button>
      </div>

      {loading ? <Spinner /> : data.length===0 ? <Empty /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:18 }}>
          {data.map(p=><PeptideCard key={p._id} peptide={p}/>)}
        </div>
      )}
      <Pagination page={page} limit={LIMIT} total={total} onChange={setPage}/>
    </div>
  );
}
