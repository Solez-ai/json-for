import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const promptTypes = [
  { value: "image", label: "Image Generation" },
  { value: "video", label: "Video Generation" },
  { value: "academic", label: "Academic Text" },
  { value: "casual", label: "Casual Query" },
  { value: "custom", label: "Custom" },
];

export default function Enhancer() {
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("image");
  const [enhancedJson, setEnhancedJson] = useState("");
  const [comparison, setComparison] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt, promptType },
      });

      if (error) throw error;

      setEnhancedJson(JSON.stringify(data.enhanced, null, 2));
      setComparison(data.comparison);
      toast.success("Prompt enhanced successfully!");
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error("Failed to enhance prompt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedJson);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([enhancedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced-prompt.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  return (
    <div className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto h-full flex flex-col"
      >
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            JSON Prompt Enhancer
          </h1>
          <p className="text-muted-foreground">
            Transform your raw prompts into structured, AI-optimized JSON
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <Card className="glass-card p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Prompt Type
                </label>
                <Select value={promptType} onValueChange={setPromptType}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    {promptTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Raw Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your raw prompt here..."
                  className="flex-1 bg-secondary/50 font-mono text-sm resize-none"
                />
              </div>

              <Button
                onClick={handleEnhance}
                disabled={isLoading}
                className="w-full gradient-primary text-white hover:opacity-90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Prompt
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold">Enhanced Output</h2>
              {enhancedJson && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {enhancedJson ? (
              <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
                <div className="bg-secondary/50 rounded-lg p-4 overflow-auto border border-border flex-1 min-h-0">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">{enhancedJson}</pre>
                </div>
                
                {comparison && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 overflow-auto max-h-[200px] flex-shrink-0">
                    <h3 className="text-sm font-semibold text-accent mb-2">
                      Before / After Comparison
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {comparison}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Enhanced JSON will appear here</p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
