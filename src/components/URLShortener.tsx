import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const URLShortener = () => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleShorten = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    const shortCode = customCode || generateShortCode();

    try {
      const { error } = await supabase
        .from("urls")
        .insert({
          original_url: url,
          short_code: shortCode,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This custom code is already taken");
        } else {
          toast.error("Failed to shorten URL");
        }
        return;
      }

      const shortened = `${window.location.origin}/${shortCode}`;
      setShortenedUrl(shortened);
      toast.success("URL shortened successfully!");
      setUrl("");
      setCustomCode("");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-8 backdrop-blur-sm bg-card/80 border-border/50 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <Link2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Shorten Your URL</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Enter your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        
        <div>
          <Input
            placeholder="Custom short code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
            maxLength={20}
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for auto-generated code
          </p>
        </div>
        
        <Button
          onClick={handleShorten}
          disabled={isLoading}
          className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          {isLoading ? "Shortening..." : "Shorten URL"}
        </Button>

        {shortenedUrl && (
          <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Your shortened URL:</p>
            <div className="flex items-center gap-2">
              <Input
                value={shortenedUrl}
                readOnly
                className="flex-1 bg-background"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="h-10 w-10"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
