const mongoose = require("mongoose");

// ── PEPTIDE / ALLERGEN ────────────────────────────────────────────────────────
const peptideSchema = new mongoose.Schema({}, { collection: "allergen_online", strict: false });
peptideSchema.index({
  Peptide_Id: "text", Peptide_Type: "text", Peptide_Description: "text",
  Toxicity: "text", Celiac_association: "text", Disease_Trait: "text",
  "HLA-DQ": "text", Protein_name: "text", gene_locus: "text",
});

// ── GWAS ──────────────────────────────────────────────────────────────────────
const gwasSchema = new mongoose.Schema({}, { collection: "gwass_data", strict: false });
gwasSchema.index({
  STUDY: "text", "DISEASE/TRAIT": "text", MAPPED_TRAIT: "text",
  "REPORTED GENE(S)": "text", MAPPED_GENE: "text", SNPS: "text",
});

// ── SNP ───────────────────────────────────────────────────────────────────────
const snpSchema = new mongoose.Schema({}, { collection: "snp_data", strict: false });
snpSchema.index({ rs_id: "text", gene: "text", summary: "text", genotype_effect: "text" });

const Peptide = mongoose.model("Peptide", peptideSchema);
const GWAS    = mongoose.model("GWAS", gwasSchema);
const SNP     = mongoose.model("SNP", snpSchema);

module.exports = { Peptide, GWAS, SNP };
