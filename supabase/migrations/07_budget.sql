create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric not null,
  category text not null,
  description text,
  fiscal_year integer not null default extract(year from now()),
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.budget_items enable row level security;

-- policies for budget
create policy "Budget items are viewable by everyone" on public.budget_items
  for select using (true);

alter table public.budget_items enable row level security;

INSERT INTO public.budget_items (title, amount, category, description, fiscal_year)
VALUES
  ('Pemeliharaan Jalan Regional', 5000000000, 'Infrastructure', 'Perbaikan dan pemeliharaan jalan primer dan sekunder di seluruh distrik.', 2025),
  ('Digitalisasi Sekolah Negeri', 2500000000, 'Education', 'Penyediaan laptop dan internet berkecepatan tinggi untuk 50 sekolah lokal.', 2025),
  ('Program Subsidi Layanan Kesehatan', 4000000000, 'Health', 'Pendanaan untuk klinik lokal dan subsidi obat-obatan bagi keluarga berpenghasilan rendah.', 2025),
  ('Sistem Pengelolaan Limbah', 1500000000, 'Environment', 'Modernisasi fasilitas pengumpulan sampah dan daur ulang.', 2025),
  ('Pusat Olahraga Masyarakat', 1000000000, 'Social', 'Pembangunan lapangan olahraga serbaguna di tiga kecamatan.', 2025),
  ('Unit Tanggap Darurat', 800000000, 'Safety', 'Pengadaan ambulans baru dan peralatan keselamatan kebakaran.', 2025);
