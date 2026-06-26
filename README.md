# Celiac Disease Integrated Bioinformatics Platform

Full-Stack Bioinformatics Web Platform built with React.js, 
Node.js, Express.js and MongoDB Atlas.

## What This Project Does
Integrates allergen peptide, SNP, and GWAS data for Celiac 
Disease into one unified searchable web platform.

## Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB Atlas

## Databases Integrated
| Source | Data Type | Records |
|--------|-----------|---------|
| AllergenOnline + IEDB | Allergen Peptides | 1,259 |
| SNPedia + bioRxiv | SNP Variants | 5,454 |
| GWAS Catalog | GWAS Records | 289 |

## Key Features
- Unified search across allergen, SNP and GWAS databases
- 3D structure prediction using AlphaFold2 (pLDDT ≥ 80)
- IC50 binding score prediction against HLA-DQ2 and HLA-DQ8
- Molecular docking using AutoDock Vina
- Export in FASTA, JSON, CSV, VCF formats


