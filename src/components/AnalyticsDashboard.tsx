import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Link2, MousePointer } from "lucide-react";

interface ClickData {
  date: string;
  clicks: number;
}

interface URLStats {
  id: string;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: string;
}

export const AnalyticsDashboard = () => {
  const [totalUrls, setTotalUrls] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [topUrls, setTopUrls] = useState<URLStats[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Get total URLs
    const { count: urlCount } = await supabase
      .from("urls")
      .select("*", { count: "exact", head: true });
    setTotalUrls(urlCount || 0);

    // Get total clicks
    const { count: clickCount } = await supabase
      .from("clicks")
      .select("*", { count: "exact", head: true });
    setTotalClicks(clickCount || 0);

    // Get clicks by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: clicksData } = await supabase
      .from("clicks")
      .select("clicked_at")
      .gte("clicked_at", sevenDaysAgo.toISOString())
      .order("clicked_at", { ascending: true });

    if (clicksData) {
      const grouped = clicksData.reduce((acc: { [key: string]: number }, click) => {
        const date = new Date(click.clicked_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(grouped).map(([date, clicks]) => ({
        date,
        clicks: clicks as number,
      }));
      setClickData(chartData);
    }

    // Get top URLs by clicks
    const { data: urls } = await supabase
      .from("urls")
      .select("id, short_code, original_url, created_at");

    if (urls) {
      const urlsWithClicks = await Promise.all(
        urls.map(async (url) => {
          const { count } = await supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .eq("url_id", url.id);
          return { ...url, clicks: count || 0 };
        })
      );

      const sorted = urlsWithClicks.sort((a, b) => b.clicks - a.clicks).slice(0, 5);
      setTopUrls(sorted);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total URLs</p>
              <p className="text-3xl font-bold mt-1">{totalUrls}</p>
            </div>
            <Link2 className="h-10 w-10 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-card shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-3xl font-bold mt-1 text-foreground">{totalClicks}</p>
            </div>
            <MousePointer className="h-10 w-10 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Clicks/URL</p>
              <p className="text-3xl font-bold mt-1 text-foreground">
                {totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : "0"}
              </p>
            </div>
            <Activity className="h-10 w-10 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Clicks Over Time (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clickData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4">Top URLs</h3>
        <div className="space-y-3">
          {topUrls.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No URLs created yet. Start by shortening your first URL!
            </p>
          ) : (
            topUrls.map((url) => (
              <div
                key={url.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-smooth"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-primary">/{url.short_code}</p>
                  <p className="text-sm text-muted-foreground truncate">{url.original_url}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-foreground">{url.clicks}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
