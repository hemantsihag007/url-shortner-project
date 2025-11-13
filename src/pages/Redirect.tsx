import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Redirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        navigate("/");
        return;
      }

      try {
        // Get the URL
        const { data: urlData, error: urlError } = await supabase
          .from("urls")
          .select("*")
          .eq("short_code", shortCode)
          .single();

        if (urlError || !urlData) {
          setError("Short link not found");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        // Track the click
        await supabase.from("clicks").insert({
          url_id: urlData.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

        // Redirect to original URL
        window.location.href = urlData.original_url;
      } catch (err) {
        setError("An error occurred");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleRedirect();
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-destructive mb-4">{error}</h1>
            <p className="text-muted-foreground">Redirecting to home...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
            <p className="text-muted-foreground">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Redirect;
