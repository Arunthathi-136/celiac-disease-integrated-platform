const express = require("express");
const router  = express.Router();
const { Peptide, GWAS, SNP } = require("./models");
 
const rx = (t) => new RegExp(t, "i");
 
// ── Natural sort for Peptide_Id (PEP1 < PEP2 < ... < PEP9 < PEP10 < PEP78)
// Extracts trailing number from IDs like PEP7, PEP10, PEP78 and sorts numerically
const peptideSort = { Peptide_Id: 1 };
// We use aggregation with $addFields to do numeric sort — see getPeptidesSorted helper
 
async function getPeptidesSorted(filter, skip, limit) {
  return Peptide.aggregate([
    { $match: filter },
    { $addFields: {
      _idNum: {
        $toInt: {
          $ifNull: [
            { $arrayElemAt: [{ $regexFindAll: { input: "$Peptide_Id", regex: /\d+/ } }, -1] },
            { v: "0" }
          ]
        }
      }
    }},
    // fallback: if $toInt fails on the array result object, just sort by string
    { $sort: { _idNum: 1, Peptide_Id: 1 } },
    { $skip: skip },
    { $limit: limit },
    { $project: { pdb_structure: 0, _idNum: 0 } },
  ]);
}
 
// simpler safe sort using $substr trick
async function getPeptidesSafe(filter, skip, lim) {
  // extract numeric part of Peptide_Id for sorting
  return Peptide.aggregate([
    { $match: filter },
    { $addFields: {
      _sortKey: {
        $convert: {
          input: { $replaceAll: { input: { $toLower: "$Peptide_Id" }, find: /[^0-9]/g, replacement: "" } },
          to: "int",
          onError: 0, onNull: 0
        }
      }
    }},
    { $sort: { _sortKey: 1, Peptide_Id: 1 } },
    { $skip: skip },
    { $limit: lim },
    { $project: { pdb_structure: 0, _sortKey: 0 } },
  ]);
}
 
// ── STATS ─────────────────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [peptides, gwas, snps] = await Promise.all([
      Peptide.countDocuments(), GWAS.countDocuments(), SNP.countDocuments(),
    ]);
    res.json({ peptides, gwas, snps });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
// ── GLOBAL SEARCH — no limit cap, searches ALL relevant fields ────────────────
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) return res.json({ peptides: [], gwas: [], snps: [], total: { peptides: 0, gwas: 0, snps: 0 } });
 
    const skip = (parseInt(page) - 1) * parseInt(limit);
 
    // Peptide — search every meaningful text field including Source organism, Protein_name etc.
    const peptideFilter = { $or: [
      { Peptide_Id: rx(q) },
      { Peptide_sequence: rx(q) },
      { Peptide_Type: rx(q) },
      { Peptide_Description: rx(q) },
      { Toxicity: rx(q) },
      { Celiac_association: rx(q) },
      { "HLA-DQ": rx(q) },
      { gene_locus: rx(q) },
      { Protein_name: rx(q) },
      { "Source organism": rx(q) },
      { Source_organism: rx(q) },
      { Chromosome: rx(q) },
      { stability: rx(q) },
      { PeptideForm: rx(q) },
      { Disease_Trait: rx(q) },
      { iedbid: rx(q) },
    ]};
 
    // GWAS — all text fields
    const gwasFilter = { $or: [
      { "DISEASE/TRAIT": rx(q) },
      { MAPPED_TRAIT: rx(q) },
      { "REPORTED GENE(S)": rx(q) },
      { MAPPED_GENE: rx(q) },
      { SNPS: rx(q) },
      { STUDY: rx(q) },
      { FIRST_AUTHOR: rx(q) },
      { JOURNAL: rx(q) },
      { REGION: rx(q) },
      { CONTEXT: rx(q) },
    ]};
 
    // SNP — all text fields
    const snpFilter = { $or: [
      { rs_id: rx(q) },
      { gene: rx(q) },
      { summary: rx(q) },
      { genotype_effect: rx(q) },
      { alleles: rx(q) },
      { risk_allele: rx(q) },
      { inheritance: rx(q) },
    ]};
 
    const [peptides, peptideTotal, gwas, gwasTotal, snps, snpTotal] = await Promise.all([
      Peptide.aggregate([
        { $match: peptideFilter },
        { $addFields: { _s: { $convert: { input: { $replaceAll: { input: { $ifNull: ["$Peptide_Id",""] }, find: { $literal: "PEP" }, replacement: "" } }, to: "int", onError: 0, onNull: 0 } } } },
        { $sort: { _s: 1, Peptide_Id: 1 } },
        { $skip: skip }, { $limit: parseInt(limit) },
        { $project: { pdb_structure: 0, _s: 0 } },
      ]),
      Peptide.countDocuments(peptideFilter),
      GWAS.find(gwasFilter).skip(skip).limit(parseInt(limit)).lean(),
      GWAS.countDocuments(gwasFilter),
      SNP.find(snpFilter).skip(skip).limit(parseInt(limit)).lean(),
      SNP.countDocuments(snpFilter),
    ]);
 
    res.json({
      peptides, gwas, snps,
      total: { peptides: peptideTotal, gwas: gwasTotal, snps: snpTotal },
      page: parseInt(page), limit: parseInt(limit),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
// ── PEPTIDES ──────────────────────────────────────────────────────────────────
router.get("/peptides", async (req, res) => {
  try {
    const { q, type, hla, toxicity, page = 1, limit = 12 } = req.query;
    const f = {};
    if (q) f.$or = [
      { Peptide_Id: rx(q) }, { Peptide_sequence: rx(q) },
      { Peptide_Type: rx(q) }, { Peptide_Description: rx(q) },
      { Toxicity: rx(q) }, { Celiac_association: rx(q) },
      { gene_locus: rx(q) }, { Protein_name: rx(q) },
      { "Source organism": rx(q) }, { Source_organism: rx(q) },
      { stability: rx(q) }, { PeptideForm: rx(q) },
      { Disease_Trait: rx(q) }, { Chromosome: rx(q) },
    ];
    if (type)     f.Peptide_Type = rx(type);
    if (hla)      f["HLA-DQ"]    = rx(hla);
    if (toxicity) f.Toxicity      = rx(toxicity);
 
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim  = parseInt(limit);
 
    // Natural numeric sort: PEP1, PEP2 … PEP9, PEP10 … PEP78
    const [data, total] = await Promise.all([
      Peptide.aggregate([
        { $match: f },
        { $addFields: { _s: { $convert: { input: { $replaceAll: { input: { $ifNull: ["$Peptide_Id",""] }, find: { $literal: "PEP" }, replacement: "" } }, to: "int", onError: 0, onNull: 0 } } } },
        { $sort: { _s: 1, Peptide_Id: 1 } },
        { $skip: skip }, { $limit: lim },
        { $project: { pdb_structure: 0, _s: 0 } },
      ]),
      Peptide.countDocuments(f),
    ]);
 
    res.json({ data, total, page: parseInt(page), limit: lim });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
router.get("/peptides/filter-options", async (req, res) => {
  try {
    const [types, hlas, toxicities] = await Promise.all([
      Peptide.distinct("Peptide_Type"), Peptide.distinct("HLA-DQ"), Peptide.distinct("Toxicity"),
    ]);
    res.json({ types, hlas, toxicities });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
router.get("/peptides/:id", async (req, res) => {
  try {
    const p = await Peptide.findOne({ Peptide_Id: req.params.id }).lean();
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
router.get("/peptides/:id/structure", async (req, res) => {
  try {
    const p = await Peptide.findOne({ Peptide_Id: req.params.id })
      .select("pdb_structure pdb_filename structure_available").lean();
    if (!p || !p.structure_available) return res.status(404).json({ error: "Structure not available" });
    res.setHeader("Content-Type", "chemical/x-pdb");
    res.setHeader("Content-Disposition", `attachment; filename="${p.pdb_filename || req.params.id + ".pdb"}"`);
    res.send(p.pdb_structure);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
// ── GWAS ──────────────────────────────────────────────────────────────────────
router.get("/gwas", async (req, res) => {
  try {
    const { q, gene, page = 1, limit = 12 } = req.query;
    const f = {};
    if (q) f.$or = [{ STUDY: rx(q) }, { "DISEASE/TRAIT": rx(q) }, { MAPPED_TRAIT: rx(q) },
      { "REPORTED GENE(S)": rx(q) }, { MAPPED_GENE: rx(q) }, { SNPS: rx(q) }, { FIRST_AUTHOR: rx(q) }];
    if (gene) f.MAPPED_GENE = rx(gene);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      GWAS.find(f).skip(skip).limit(parseInt(limit)).lean(),
      GWAS.countDocuments(f),
    ]);
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
router.get("/gwas/:id", async (req, res) => {
  try {
    const g = await GWAS.findById(req.params.id).lean();
    if (!g) return res.status(404).json({ error: "Not found" });
    res.json(g);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
// ── SNP ───────────────────────────────────────────────────────────────────────
router.get("/snps", async (req, res) => {
  try {
    const { q, gene, page = 1, limit = 12 } = req.query;
    const f = {};
    if (q) f.$or = [{ rs_id: rx(q) }, { gene: rx(q) }, { summary: rx(q) }, { genotype_effect: rx(q) }];
    if (gene) f.gene = rx(gene);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      SNP.find(f).skip(skip).limit(parseInt(limit)).lean(),
      SNP.countDocuments(f),
    ]);
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
router.get("/snps/:rsid", async (req, res) => {
  try {
    const s = await SNP.findOne({ rs_id: req.params.rsid }).lean();
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
 
module.exports = router;
