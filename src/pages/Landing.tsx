import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wand2, Network } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const modules = [
    {
      title: "JSON Prompt Enhancer",
      description: "Transform raw prompts into structured, optimized JSON using AI",
      icon: Wand2,
      path: "/enhancer",
      gradient: "gradient-primary",
    },
    {
      title: "JSON Visualizer",
      description: "Visualize and explore JSON data with interactive node graphs",
      icon: Network,
      path: "/visualizer",
      gradient: "gradient-accent",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-gradient">Lovable</span> For JSON
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose a module to get started with AI-powered JSON tools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={module.path}>
                <Card className="glass-card p-8 group cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 border-2 hover:border-primary/50">
                  <div className={`w-16 h-16 rounded-2xl ${module.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {module.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
