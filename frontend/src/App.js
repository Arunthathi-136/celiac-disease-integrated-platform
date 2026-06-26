import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PeptidesPage from "./pages/PeptidesPage";
import PeptideDetailPage from "./pages/PeptideDetailPage";
import GWASPage from "./pages/GWASPage";
import GWASDetailPage from "./pages/GWASDetailPage";
import SNPsPage from "./pages/SNPsPage";
import SNPDetailPage from "./pages/SNPDetailPage";
import SearchPage from "./pages/SearchPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"             element={<HomePage />} />
        <Route path="/peptides"     element={<PeptidesPage />} />
        <Route path="/peptides/:id" element={<PeptideDetailPage />} />
        <Route path="/gwas"         element={<GWASPage />} />
        <Route path="/gwas/:id"     element={<GWASDetailPage />} />
        <Route path="/snps"         element={<SNPsPage />} />
        <Route path="/snps/:rs_id" element={<SNPDetailPage />} />
        <Route path="/search"       element={<SearchPage />} />
        <Route path="*"             element={
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text2)" }}>
            <h2 style={{ fontFamily: "DM Serif Display", fontSize: 32, marginBottom: 12 }}>404</h2>
            <p>Page not found.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
