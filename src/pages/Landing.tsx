import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wand2, Network, Twitter, Github, Star } from "lucide-react";
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
      title: "AI JSON Explainer",
      description: "Transform complex JSON into human-readable explanations with AI",
      icon: Network,
      path: "/visualizer",
      gradient: "gradient-accent",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full flex-1 flex flex-col justify-center">
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-16 text-center space-y-4"
      >
        {/* Built By */}
        <div className="flex items-center justify-center gap-3">
          <p className="text-lg font-semibold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            Built By Samin Yeasar (Solez-AI)
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/Solez_None"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Solez-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Project Info */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            This Project was built for The Lovable Build Challenge Day 3
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              This Project is Open Source, Visit at
            </span>
            <a
              href="https://github.com/Solez-ai/json-for.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors font-medium inline-flex items-center gap-1"
            >
              GitHub
              <Star className="w-4 h-4" />
            </a>
            <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              and Star The project to Support it!
            </span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
