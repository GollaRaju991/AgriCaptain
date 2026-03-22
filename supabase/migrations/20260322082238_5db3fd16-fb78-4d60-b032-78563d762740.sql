
-- Farm workers table - profiles managed from agrizinpartner app
CREATE TABLE public.farm_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text,
  worker_types text[] NOT NULL DEFAULT '{}',
  experience text,
  rating numeric DEFAULT 0,
  daily_rate numeric DEFAULT 0,
  state text,
  district text,
  mandal text,
  village text,
  availability text NOT NULL DEFAULT 'Available',
  category text NOT NULL DEFAULT 'Single',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farm_workers ENABLE ROW LEVEL SECURITY;

-- Public read access for searching workers
CREATE POLICY "Anyone can view active farm workers"
  ON public.farm_workers FOR SELECT
  USING (is_active = true);

-- Allow authenticated users (partner app) to manage workers
CREATE POLICY "Authenticated users can insert farm workers"
  ON public.farm_workers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update farm workers"
  ON public.farm_workers FOR UPDATE
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO public.farm_workers (name, phone, photo_url, worker_types, experience, rating, daily_rate, state, district, mandal, village, availability, category) VALUES
  ('Rajesh Kumar', '+91 98765 43210', 'https://i.pravatar.cc/150?img=11', ARRAY['Field Worker', 'General Laborer'], '5 years', 4.5, 500, 'TS', 'rangareddy', 'ibrahimpatnam', '', 'Available', 'Single'),
  ('Suresh Patel', '+91 87654 32109', 'https://i.pravatar.cc/150?img=12', ARRAY['Harvester', 'Equipment Operator'], '8 years', 4.8, 600, 'TS', 'rangareddy', 'chevella', '', 'Available', 'Group'),
  ('Anil Reddy', '+91 76543 21098', 'https://i.pravatar.cc/150?img=14', ARRAY['Planting Specialist', 'Irrigation Expert'], '6 years', 4.3, 550, 'TS', 'medchal', 'keesara', '', 'Available', 'Single'),
  ('Venkat Rao', '+91 65432 10987', 'https://i.pravatar.cc/150?img=15', ARRAY['Pesticide Applicator', 'Supervisor'], '10 years', 4.9, 700, 'TS', 'medchal', 'ghatkesar', '', 'Available', 'Group'),
  ('Ramesh Goud', '+91 54321 09876', 'https://i.pravatar.cc/150?img=16', ARRAY['Field Worker', 'Harvester', 'General Laborer'], '4 years', 4.2, 450, 'TS', 'rangareddy', 'shamshabad', '', 'Available', 'Single');
