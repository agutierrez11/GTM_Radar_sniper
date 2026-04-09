import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SemanticSearchRequest {
  query: string;
  match_threshold?: number;
  match_count?: number;
  filter_pais?: string;
  filter_tier?: string;
  filter_vertical?: string;
}

export const nervApi = {
  // Empresas
  getEmpresas: async (limit = 20, offset = 0) => {
    const response = await apiClient.get('/empresas/', {
      params: { limit, offset },
    });
    return response.data;
  },

  getEmpresaById: async (id: number) => {
    const response = await apiClient.get(`/empresas/${id}`);
    return response.data;
  },

  // Búsqueda Semántica (FastAPI + pgvector)
  searchEmpresas: async (request: SemanticSearchRequest) => {
    const response = await apiClient.post('/empresas/search', request);
    return response.data;
  },

  // Enriquecimiento (Background Tasks)
  enrichEmpresas: async (urls: string[]) => {
    const response = await apiClient.post('/empresas/enrich', urls);
    return response.data;
  },

  // Análisis Nexus (Swarm de Agentes) — puede tardar >60s; nginx y axios deben permitirlo
  analyzeNexus: async (payload: any) => {
    const response = await apiClient.post('/empresas/nexus', payload, {
      timeout: 300000,
    });
    return response.data;
  },

  // Health Check
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
