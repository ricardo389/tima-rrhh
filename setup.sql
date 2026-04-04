-- TIMA GRUPO — Supabase Database Setup
-- Paste this into Supabase Dashboard > SQL Editor > Run

-- ============================================================
-- UNIFORM TABLES (v2)
-- ============================================================

-- Types de prendas par local
CREATE TABLE IF NOT EXISTS uniform_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL,
  nom TEXT NOT NULL,
  description TEXT DEFAULT '',
  stock_total INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assignments/livraisons aux employes
CREATE TABLE IF NOT EXISTS uniform_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  employee_nom TEXT NOT NULL,
  local TEXT NOT NULL,
  uniform_type_id UUID REFERENCES uniform_types(id) ON DELETE CASCADE,
  uniform_nom TEXT NOT NULL,
  taille TEXT DEFAULT '',
  quantite INT DEFAULT 1,
  date_livraison DATE,
  date_retour DATE,
  retourne BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE uniform_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_assignments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='uniform_types' AND policyname='allow_all_uniform_types') THEN
    CREATE POLICY allow_all_uniform_types ON uniform_types FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='uniform_assignments' AND policyname='allow_all_uniform_assignments') THEN
    CREATE POLICY allow_all_uniform_assignments ON uniform_assignments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_uniform_types_local ON uniform_types(local);
CREATE INDEX IF NOT EXISTS idx_uniform_assign_local ON uniform_assignments(local);
CREATE INDEX IF NOT EXISTS idx_uniform_assign_emp ON uniform_assignments(employee_id);

-- Turnos config (shift hours per local)
CREATE TABLE IF NOT EXISTS turnos_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL UNIQUE,
  matin_entree TEXT DEFAULT '08:00',
  matin_sortie TEXT DEFAULT '16:00',
  soir_entree TEXT DEFAULT '16:00',
  soir_sortie TEXT DEFAULT '00:00',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE turnos_config ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='turnos_config' AND policyname='allow_all_turnos_config') THEN
    CREATE POLICY allow_all_turnos_config ON turnos_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Empleados
CREATE TABLE IF NOT EXISTS empleados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  poste TEXT NOT NULL,
  local TEXT NOT NULL,
  marque TEXT DEFAULT '',
  date_entree DATE DEFAULT CURRENT_DATE,
  actif BOOLEAN DEFAULT true,
  telephone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Presences
CREATE TABLE IF NOT EXISTS presences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employe_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  employe_nom TEXT NOT NULL,
  local TEXT NOT NULL,
  date DATE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('present','absent')),
  heure TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Absences
CREATE TABLE IF NOT EXISTS absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employe_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  employe_nom TEXT NOT NULL,
  local TEXT NOT NULL,
  date DATE NOT NULL,
  motif TEXT NOT NULL,
  prevenu TEXT DEFAULT 'non' CHECK (prevenu IN ('oui','non')),
  reporte_par TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Plannings (one row per employee per week)
CREATE TABLE IF NOT EXISTS plannings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employe_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  employe_nom TEXT NOT NULL,
  local TEXT NOT NULL,
  semaine TEXT NOT NULL,
  lundi TEXT DEFAULT '',
  mardi TEXT DEFAULT '',
  mercredi TEXT DEFAULT '',
  jeudi TEXT DEFAULT '',
  vendredi TEXT DEFAULT '',
  samedi TEXT DEFAULT '',
  dimanche TEXT DEFAULT '',
  publie BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employe_id, semaine)
);

-- Recrutements (candidats)
CREATE TABLE IF NOT EXISTS recrutements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  tel TEXT DEFAULT '',
  local TEXT NOT NULL,
  poste TEXT NOT NULL,
  etape TEXT DEFAULT 'recu' CHECK (etape IN ('recu','entretien','selectionne','embauche')),
  demande_id UUID,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Demandes de personnel
CREATE TABLE IF NOT EXISTS demandes_personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL,
  poste TEXT NOT NULL,
  urgence TEXT DEFAULT 'normale' CHECK (urgence IN ('normale','haute','urgente')),
  motif TEXT DEFAULT '',
  date DATE DEFAULT CURRENT_DATE,
  statut TEXT DEFAULT 'ouverte' CHECK (statut IN ('ouverte','en cours','pourvu')),
  demande_par TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uniformes
CREATE TABLE IF NOT EXISTS uniformes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employe_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  employe_nom TEXT NOT NULL,
  local TEXT NOT NULL,
  taille_haut TEXT DEFAULT '',
  taille_bas TEXT DEFAULT '',
  pointure TEXT DEFAULT '',
  casquette TEXT DEFAULT '',
  statut_livraison TEXT DEFAULT 'en attente' CHECK (statut_livraison IN ('en attente','livre')),
  date_livraison DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS + allow-all policies
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recrutements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniformes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='empleados' AND policyname='allow_all_empleados') THEN
    CREATE POLICY allow_all_empleados ON empleados FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='presences' AND policyname='allow_all_presences') THEN
    CREATE POLICY allow_all_presences ON presences FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='absences' AND policyname='allow_all_absences') THEN
    CREATE POLICY allow_all_absences ON absences FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plannings' AND policyname='allow_all_plannings') THEN
    CREATE POLICY allow_all_plannings ON plannings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recrutements' AND policyname='allow_all_recrutements') THEN
    CREATE POLICY allow_all_recrutements ON recrutements FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='demandes_personnel' AND policyname='allow_all_demandes') THEN
    CREATE POLICY allow_all_demandes ON demandes_personnel FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='uniformes' AND policyname='allow_all_uniformes') THEN
    CREATE POLICY allow_all_uniformes ON uniformes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_empleados_local ON empleados(local);
CREATE INDEX IF NOT EXISTS idx_empleados_actif ON empleados(actif);
CREATE INDEX IF NOT EXISTS idx_presences_date_local ON presences(date, local);
CREATE INDEX IF NOT EXISTS idx_absences_local ON absences(local);
CREATE INDEX IF NOT EXISTS idx_plannings_semaine ON plannings(semaine, local);
CREATE INDEX IF NOT EXISTS idx_demandes_local ON demandes_personnel(local);

-- Seed Cluky's Marif employees
INSERT INTO empleados (nom, poste, local, marque, date_entree, actif) VALUES
  ('Smail Naceh','Gerant Matin','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Soufiane Bardaoui','Gerant Soir','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Imane Najim','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Asmaa Buda','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Yahya Diyab','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Ismail Aasli','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Reda Filali','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Nouhaila Moufrij','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Hatime Alhawari','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Marwane Ghailan','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Zakariya Abd Sadek','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Yahya Elghazi','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Said Bizgaren','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Sami Chabbouk','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Amine','Polyvalent Cuisine','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Saad Hamoussa','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Marwane Sabri','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Yasser Assal','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Khalid','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Akrame Kendi','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Mohamed','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Yassine Benlmalem','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Yahya Bribri','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Aymane Daifi','Polyvalent Salle','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Kaltoum Atouzar','Plonge','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Oussama Fahir','Plonge','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Nizar','Operateur Laboratoire','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Jamal','Operateur Laboratoire','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Chouaibe Tawdi','Operateur Laboratoire','Cluky''s Marif','Cluky''s','2025-01-01',true),
  ('Mohammed','Operateur Laboratoire','Cluky''s Marif','Cluky''s','2025-01-01',true)
ON CONFLICT DO NOTHING;
