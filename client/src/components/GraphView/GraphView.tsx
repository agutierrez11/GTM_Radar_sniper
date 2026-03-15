// GTM Radar - Graph View Principal
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD
// Inspiración: Heuristica.ca, Linear, Vercel
// CrewAI: botón de análisis automático con estado de loading

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sparkles, Download, Share2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import GraphNode from './GraphNode';
import NodePanel from './NodePanel';
import { fetchLeadById, mapToGraph } from '@/lib/dataService';
import { getNodePositions, simulateCrewAIAnalysis, type LeadNode, type LeadGraph } from '@/lib/graphData';

const nodeTypes = { concept: GraphNode };

interface GraphViewProps {
  leadId: string;
}

export default function GraphView({ leadId }: GraphViewProps) {
  const [graph, setGraph] = useState<LeadGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<LeadNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sincronizar grafo cuando cambia el lead
  useEffect(() => {
    async function load() {
        if (!leadId) return;
        setLoading(true);
        const lead = await fetchLeadById(leadId);
        if (lead) {
            setGraph(mapToGraph(lead));
        }
        setLoading(false);
    }
    load();
    setSelectedNode(null);
  }, [leadId]);

  // Construir nodos y edges de React Flow cuando cambia el grafo
  useEffect(() => {
    if (!graph) return;

    const positions = getNodePositions(graph.nodes.length);

    const rfNodes: Node[] = graph.nodes.map((node, idx) => ({
      id: node.id,
      type: 'concept',
      position: positions[idx],
      data: {
        label: node.label,
        content: node.content,
        color: node.color,
        type: node.type,
        aiAnalyzed: graph.aiAnalyzed,
      },
    }));

    const rfEdges: Edge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      style: {
        stroke: graph.aiAnalyzed ? '#bfdbfe' : '#d1d5db',
        strokeWidth: graph.aiAnalyzed ? 2 : 1.5,
      },
      labelStyle: {
        fontSize: 10,
        fill: '#9ca3af',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      animated: graph.aiAnalyzed,
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [graph, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const found = graph?.nodes.find((n) => n.id === node.id) || null;
      setSelectedNode(found);
    },
    [graph]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Análisis automático con CrewAI (simulado - conectar con backend real)
  const handleCrewAIAnalysis = async () => {
    if (!graph || isAnalyzing) return;
    setIsAnalyzing(true);
    toast.info(`Analizando ${graph.company} con CrewAI...`, {
      description: '4 agentes trabajando: Research, Analysis, Strategy, Report',
      duration: 3000,
    });

    try {
      const result = await simulateCrewAIAnalysis(leadId);
      setGraph((prev) => prev ? { ...prev, ...result } : prev);
      toast.success(`Análisis completado para ${graph.company}`, {
        description: 'Mapa conceptual actualizado con insights de IA',
        duration: 4000,
      });
    } catch {
      toast.error('Error en el análisis. Intenta de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    toast.info('Exportación disponible con backend conectado', {
      description: 'Conecta el backend para exportar como PNG/PDF',
    });
  };

  const handleShare = () => {
    toast.info('Compartir disponible con backend conectado', {
      description: 'Conecta el backend para compartir análisis',
    });
  };

  if (!graph) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: '#9ca3af',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px',
      }}>
        Selecciona un lead para ver su mapa conceptual
      </div>
    );
  }

  const statusColor = graph.status === 'diamond' ? '#7c3aed'
    : graph.status === 'gold' ? '#d97706'
    : '#6b7280';
  const statusBg = graph.status === 'diamond' ? '#f5f3ff'
    : graph.status === 'gold' ? '#fef3c7'
    : '#f3f4f6';
  const statusBorder = graph.status === 'diamond' ? '#ddd6fe'
    : graph.status === 'gold' ? '#fde68a'
    : '#e5e7eb';

  return (
    <div style={{ display: 'flex', height: '100%', gap: '16px' }}>
      {/* Canvas del grafo */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Info del lead */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#378ADD',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {graph.company.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {graph.company}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {graph.leadName}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 500, color: statusColor,
                  background: statusBg, padding: '1px 8px', borderRadius: '20px',
                  border: `1px solid ${statusBorder}`, fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  Score {graph.score}
                </span>
                {/* Badge CrewAI */}
                {graph.aiAnalyzed && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', fontWeight: 500, color: '#166534',
                    background: '#f0fdf4', padding: '1px 8px', borderRadius: '20px',
                    border: '1px solid #bbf7d0', fontFamily: 'Inter, system-ui, sans-serif',
                  }}>
                    <CheckCircle2 size={10} />
                    Analizado con IA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={handleShare} style={{
              background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '5px', fontSize: '12px', color: '#374151', fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              <Share2 size={12} />
              Compartir
            </button>
            <button onClick={handleExport} style={{
              background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px',
              padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '5px', fontSize: '12px', color: '#374151', fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              <Download size={12} />
              Exportar
            </button>
            {/* Botón CrewAI */}
            <button
              onClick={handleCrewAIAnalysis}
              disabled={isAnalyzing || graph.aiAnalyzed}
              style={{
                background: graph.aiAnalyzed ? '#f0fdf4' : isAnalyzing ? '#f3f4f6' : '#378ADD',
                border: `1px solid ${graph.aiAnalyzed ? '#bbf7d0' : isAnalyzing ? '#e5e7eb' : 'transparent'}`,
                borderRadius: '8px', padding: '5px 12px', cursor: graph.aiAnalyzed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500,
                color: graph.aiAnalyzed ? '#166534' : isAnalyzing ? '#9ca3af' : '#ffffff',
                fontFamily: 'Inter, system-ui, sans-serif',
                transition: 'all 0.15s ease',
                opacity: isAnalyzing ? 0.7 : 1,
              }}
            >
              {isAnalyzing ? (
                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />Analizando...</>
              ) : graph.aiAnalyzed ? (
                <><CheckCircle2 size={12} />Analizado</>
              ) : (
                <><Sparkles size={12} />Analizar con IA</>
              )}
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div style={{ height: '100%', paddingTop: '52px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.3}
            maxZoom={2}
            attributionPosition="bottom-right"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={graph.aiAnalyzed ? '#dbeafe' : '#e5e7eb'}
            />
            <Controls style={{
              border: '1px solid #e5e7eb', borderRadius: '10px',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }} />
            <MiniMap
              style={{
                border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden',
              }}
              nodeColor={(node) => {
                const color = (node.data as { color?: string }).color || 'gray';
                const colorMap: Record<string, string> = {
                  blue: '#bfdbfe', green: '#bbf7d0', amber: '#fde68a',
                  red: '#fecaca', purple: '#e9d5ff', gray: '#e5e7eb',
                };
                return colorMap[color] || '#e5e7eb';
              }}
              maskColor="rgba(249,250,251,0.8)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Panel lateral del nodo seleccionado */}
      {selectedNode && (
        <NodePanel
          node={selectedNode}
          leadName={graph.leadName}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
