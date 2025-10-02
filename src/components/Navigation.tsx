import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-accent transition-transform group-hover:scale-110 group-hover:rotate-12" />
            <h1 className="text-2xl font-bold">
              <span className="text-gradient">Lovable</span>
              <span className="text-foreground"> For JSON</span>
            </h1>
          </Link>
          
          {location.pathname !== "/" && (
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
