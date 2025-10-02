import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, AlertCircle, Loader2, FileText, BookOpen, MessageSquare, FileSearch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";

export default function Visualizer() {
  const [jsonText, setJsonText] = useState("{}");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [summary, setSummary] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("explain");

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setJsonText(text);
          toast.success("File loaded!");
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted!");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      toast.error("Cannot format invalid JSON");
    }
  };

  const analyzeJSON = async (type: "explain" | "docs" | "summary" | "query", query?: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      setError("");
      setLoading(true);

      const { data, error: functionError } = await supabase.functions.invoke('analyze-json', {
        body: { jsonData: parsed, type, query }
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze JSON";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    const result = await analyzeJSON("explain");
    if (result) {
      setExplanation(result);
      setActiveTab("explain");
      toast.success("JSON explained!");
    }
  };

  const handleGenerateDocs = async () => {
    const result = await analyzeJSON("docs");
    if (result) {
      setDocumentation(result);
      setActiveTab("docs");
      toast.success("Documentation generated!");
    }
  };

  const handleGenerateSummary = async () => {
    const result = await analyzeJSON("summary");
    if (result) {
      setSummary(result);
      setActiveTab("summary");
      toast.success("Summary generated!");
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    const result = await analyzeJSON("query", chatInput);
    if (result) {
      const aiMessage = { role: "assistant", content: result };
      setChatMessages(prev => [...prev, aiMessage]);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1800px] mx-auto h-full flex flex-col"
      >
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" />
            AI JSON Explainer
          </h1>
          <p className="text-muted-foreground">
            Transform complex JSON into human-readable explanations and documentation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <Card className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 rounded-lg flex items-start gap-2 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive break-words">{error}</p>
              </div>
            )}

            <div className="flex-1 border border-border rounded-lg overflow-hidden mb-4 min-h-0">
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

            <div className="grid grid-cols-3 gap-2 flex-shrink-0">
              <Button
                onClick={handleExplain}
                disabled={loading}
                className="gradient-primary text-white"
                size="sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Explain
              </Button>
              <Button
                onClick={handleGenerateDocs}
                disabled={loading}
                className="gradient-accent text-white"
                size="sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                Docs
              </Button>
              <Button
                onClick={handleGenerateSummary}
                disabled={loading}
                className="gradient-primary text-white"
                size="sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4 mr-2" />}
                Summary
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-6 flex flex-col min-h-0">
            <h2 className="text-xl font-semibold mb-4 flex-shrink-0">AI Analysis</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-4 mb-4 flex-shrink-0">
                <TabsTrigger value="explain">Explain</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="explain" className="flex-1 min-h-0 mt-0">
                <div className="p-4 bg-secondary/20 rounded-lg border border-border h-full overflow-auto">
                  {explanation ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{explanation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click "Explain" to get a plain English explanation of your JSON structure.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="docs" className="flex-1 min-h-0 mt-0">
                <div className="p-4 bg-secondary/20 rounded-lg border border-border h-full overflow-auto">
                  {documentation ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{documentation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click "Docs" to generate comprehensive developer documentation.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 min-h-0 mt-0">
                <div className="p-4 bg-secondary/20 rounded-lg border border-border h-full overflow-auto">
                  {summary ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{summary}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click "Summary" to get a concise overview with key insights.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
                <div className="flex-1 overflow-auto p-4 bg-secondary/20 rounded-lg border border-border mb-4 space-y-3 min-h-0">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ask questions about your JSON data. For example: "What is the total count?" or "Which item has the highest value?"</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/20 ml-12"
                            : "bg-accent/20 mr-12"
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {msg.role === "user" ? "You" : "AI"}
                        </p>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Textarea
                    placeholder="Ask a question about your JSON..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    className="h-[80px] bg-secondary/50 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleChatSubmit}
                    disabled={loading || !chatInput.trim()}
                    className="gradient-accent text-white self-end"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
