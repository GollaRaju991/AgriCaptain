-- Create category_vendors table for category-based vendor assignment
CREATE TABLE public.category_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  address TEXT NOT NULL,
  license_number TEXT NOT NULL,
  category TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.category_vendors ENABLE ROW LEVEL SECURITY;

-- Public read access (vendor info shown on product pages)
CREATE POLICY "Anyone can view category vendors"
ON public.category_vendors
FOR SELECT
USING (true);

-- Seed initial vendor data
INSERT INTO public.category_vendors (vendor_name, address, license_number, category) VALUES
  ('Laxmi Narayana', 'Jogulamba Gadwal, Telangana', 'TG-AGRI-87456321', 'Pesticides'),
  ('Ramesh Reddy', 'Jogulamba Gadwal, Telangana', 'TG-AGRI-65892347', 'Seeds'),
  ('Suresh Kumar', 'Jogulamba Gadwal, Telangana', 'TG-AGRI-92345678', 'Agriculture Products');
