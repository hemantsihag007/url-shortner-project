import { URLShortener } from "@/components/URLShortener";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Zap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            URL Shortener
          </h1>
        </div>
        
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Create short, memorable links and track their performance with detailed analytics
        </p>

        <div className="max-w-4xl mx-auto space-y-12">
          <URLShortener />
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
};

export default Index;
