import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getStats              = ()       => api.get("/stats");
export const globalSearch          = (q, page=1, limit=12) => api.get("/search", { params: { q, page, limit } });

export const getPeptides           = (p)      => api.get("/peptides", { params: p });
export const getPeptide            = (id)     => api.get(`/peptides/${id}`);
export const getPeptideFilterOpts  = ()       => api.get("/peptides/filter-options");
export const getPeptideStructureUrl= (id)     => `/api/peptides/${id}/structure`;

export const getGWAS               = (p)      => api.get("/gwas", { params: p });
export const getGWASEntry          = (id)     => api.get(`/gwas/${id}`);

export const getSNPs               = (p)      => api.get("/snps", { params: p });
export const getSNP                = (rsid)   => api.get(`/snps/${rsid}`);

export default api;
