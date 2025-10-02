import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Network, Upload, Download, Search, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

export default function Visualizer() {
  const [jsonText, setJsonText] = useState("{}");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const buildGraph = useCallback((data: any, parentId = "", x = 0, y = 0, depth = 0): { nodes: Node[], edges: Edge[] } => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const horizontalSpacing = 250;
    const verticalSpacing = 150;

    const createNode = (id: string, label: string, type: "object" | "array" | "value", value?: any) => {
      const colors = {
        object: "hsl(var(--node-object))",
        array: "hsl(var(--node-array))",
        value: "hsl(var(--node-value))",
      };

      return {
        id,
        position: { x, y },
        data: { label, value },
        style: {
          background: colors[type],
          color: "white",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: type === "array" ? "50%" : "8px",
          padding: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          minWidth: type === "value" ? "100px" : "140px",
        },
      };
    };

    const processValue = (key: string, value: any, currentId: string, currentX: number, currentY: number, currentDepth: number) => {
      if (value === null || value === undefined) {
        const nodeId = `${currentId}-${key}`;
        newNodes.push(createNode(nodeId, `${key}: null`, "value", null));
        newEdges.push({ id: `${currentId}-${nodeId}`, source: currentId, target: nodeId });
      } else if (typeof value === "object" && !Array.isArray(value)) {
        const nodeId = `${currentId}-${key}`;
        newNodes.push(createNode(nodeId, key, "object"));
        if (currentId) {
          newEdges.push({ id: `${currentId}-${nodeId}`, source: currentId, target: nodeId });
        }
        
        const keys = Object.keys(value);
        keys.forEach((k, i) => {
          const childX = currentX + (i - keys.length / 2) * horizontalSpacing;
          const childY = currentY + verticalSpacing;
          const result = processValue(k, value[k], nodeId, childX, childY, currentDepth + 1);
          newNodes.push(...result.nodes);
          newEdges.push(...result.edges);
        });
      } else if (Array.isArray(value)) {
        const nodeId = `${currentId}-${key}`;
        newNodes.push(createNode(nodeId, `${key}[]`, "array"));
        if (currentId) {
          newEdges.push({ id: `${currentId}-${nodeId}`, source: currentId, target: nodeId });
        }
        
        value.forEach((item, i) => {
          const childX = currentX + (i - value.length / 2) * horizontalSpacing;
          const childY = currentY + verticalSpacing;
          const result = processValue(`[${i}]`, item, nodeId, childX, childY, currentDepth + 1);
          newNodes.push(...result.nodes);
          newEdges.push(...result.edges);
        });
      } else {
        const nodeId = `${currentId}-${key}`;
        const displayValue = typeof value === "string" ? `"${value}"` : String(value);
        newNodes.push(createNode(nodeId, `${key}: ${displayValue}`, "value", value));
        if (currentId) {
          newEdges.push({ id: `${currentId}-${nodeId}`, source: currentId, target: nodeId });
        }
      }
      
      return { nodes: newNodes, edges: newEdges };
    };

    const rootId = "root";
    if (typeof data === "object" && !Array.isArray(data)) {
      newNodes.push(createNode(rootId, "root", "object"));
      const keys = Object.keys(data);
      keys.forEach((key, i) => {
        const childX = (i - keys.length / 2) * horizontalSpacing;
        const childY = verticalSpacing;
        const result = processValue(key, data[key], rootId, childX, childY, 1);
        newNodes.push(...result.nodes);
        newEdges.push(...result.edges);
      });
    }

    return { nodes: newNodes, edges: newEdges };
  }, []);

  const handleParse = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setError("");
      const { nodes: newNodes, edges: newEdges } = buildGraph(parsed);
      setNodes(newNodes);
      setEdges(newEdges);
      toast.success("JSON parsed and visualized!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      toast.error("Failed to parse JSON");
    }
  }, [jsonText, buildGraph, setNodes, setEdges]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted!");
    } catch (err) {
      toast.error("Cannot format invalid JSON");
    }
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setJsonText(event.target?.result as string);
          toast.success("File loaded!");
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1800px] mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Network className="w-8 h-8 text-accent" />
            JSON Visualizer
          </h1>
          <p className="text-muted-foreground">
            Explore JSON data with interactive node graphs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <Card className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">JSON Editor</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  className="border-accent/50 hover:bg-accent/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormat}
                  className="border-accent/50 hover:bg-accent/10"
                >
                  Format
                </Button>
                <Button
                  onClick={handleParse}
                  className="gradient-accent text-white"
                  size="sm"
                >
                  Visualize
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex-1 border border-border rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonText}
                onChange={(value) => setJsonText(value || "{}")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
          </Card>

          <Card className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Graph View</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 bg-secondary/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent/50 hover:bg-accent/10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 border border-border rounded-lg overflow-hidden bg-secondary/20">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    if (node.style?.background) {
                      return node.style.background as string;
                    }
                    return "#333";
                  }}
                />
              </ReactFlow>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
