-- Create urls table for storing shortened URLs
CREATE TABLE public.urls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  user_id uuid,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT,
  CONSTRAINT urls_short_code_length CHECK (char_length(short_code) >= 3 AND char_length(short_code) <= 20)
);

-- Create clicks table for analytics
CREATE TABLE public.clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id uuid NOT NULL REFERENCES public.urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  ip_address TEXT
);

-- Enable Row Level Security
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for urls table (public read, anyone can create)
CREATE POLICY "Anyone can view URLs"
  ON public.urls
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create URLs"
  ON public.urls
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for clicks table (public read and insert)
CREATE POLICY "Anyone can view clicks"
  ON public.clicks
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can track clicks"
  ON public.clicks
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_urls_short_code ON public.urls(short_code);
CREATE INDEX idx_clicks_url_id ON public.clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON public.clicks(clicked_at DESC);