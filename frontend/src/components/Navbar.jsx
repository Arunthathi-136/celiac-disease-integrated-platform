import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dna, Activity, FlaskConical, Search, Menu, X } from "lucide-react";

const LINKS = [
  { to: "/peptides", label: "Allergen / Peptides", icon: <Dna size={14} /> },
  { to: "/gwas",     label: "GWAS Studies",        icon: <Activity size={14} /> },
  { to: "/snps",     label: "SNP Variants",         icon: <FlaskConical size={14} /> },
];

export default function Navbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const go = (e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <>
      {/* Top accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #1a6fc4 0%, #0d7377 50%, #1a6fc4 100%)" }} />

      <nav style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,.07)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 24, height: 64 }}>

          {/* Logo + Heading */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,#1a6fc4,#0d7377)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,111,196,.3)",
            }}>
              <Dna size={20} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}>
                Celiac Research Portal
              </div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
               
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {LINKS.map(({ to, label, icon }) => {
              const active = loc.pathname.startsWith(to);
              return (
                <Link key={to} to={to} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                  background: active ? "#dbeafe" : "transparent",
                  color: active ? "#1e40af" : "#475569",
                  borderBottom: active ? "2px solid #1a6fc4" : "2px solid transparent",
                  transition: "all .15s",
                }}>
                  {icon}{label}
                </Link>
              );
            })}
          </div>

          {/* Search bar */}
          <form onSubmit={go} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 9, padding: "7px 13px", width: 250,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,.05)",
          }}>
            <Search size={13} color="#94a3b8" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search all databases…"
              style={{
                background: "none", border: "none", fontSize: 13,
                padding: 0, width: "100%", boxShadow: "none", color: "#0f172a",
              }} />
          </form>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            style={{ display: "none", background: "none", border: "none", color: "#475569", cursor: "pointer" }}
            id="ham">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ padding: "10px 0 14px", borderTop: "1px solid #f1f5f9", background: "#fff" }}>
            {LINKS.map(({ to, label, icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", fontSize: 14, textDecoration: "none",
                color: loc.pathname.startsWith(to) ? "#1e40af" : "#475569",
                background: loc.pathname.startsWith(to) ? "#dbeafe" : "transparent",
              }}>
                {icon}{label}
              </Link>
            ))}
          </div>
        )}

        <style>{`@media(max-width:768px){#ham{display:block!important;}}`}</style>
      </nav>
    </>
  );
}
