import axios from 'axios';

// Táctica de Túnel: Usar ruta relativa para que Next.js haga el proxy
const API_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Logs Tácticos: Interceptores para monitorear la integración
apiClient.interceptors.request.use((config) => {
  console.log(`[NERV API] 🛰️ Sending ${config.method?.toUpperCase()} to ${config.url}`, config.data || "");
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[NERV API] ✅ Received from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`[NERV API] ❌ Error in ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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

  // Análisis Nexus (Swarm de Agentes)
  analyzeNexus: async (payload: any) => {
    const response = await apiClient.post('/empresas/nexus', payload);
    return response.data;
  },

  // Health Check
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
