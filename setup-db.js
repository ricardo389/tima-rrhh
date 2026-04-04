/**
 * TIMA GRUPO — Supabase Database Setup
 *
 * Run with: node setup-db.js
 * Or paste the SQL below directly into the Supabase SQL Editor (Dashboard > SQL Editor)
 *
 * This script:
 * 1. Creates all required tables
 * 2. Seeds Cluky's Marif employees
 */

const SUPABASE_URL = 'https://zkyvvrdatmvdttnfxucy.supabase.co';
const SUPABASE_KEY = 'YOUR_SERVICE_KEY_HERE';

// ============================================================
// SQL to create all tables — can also be pasted into SQL Editor
// ============================================================
const CREATE_SQL = `
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

-- Enable RLS but allow all for now (anon key)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recrutements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniformes ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations for authenticated/anon
DO $$
BEGIN
  -- empleados
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='empleados' AND policyname='allow_all_empleados') THEN
    CREATE POLICY allow_all_empleados ON empleados FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- presences
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='presences' AND policyname='allow_all_presences') THEN
    CREATE POLICY allow_all_presences ON presences FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- absences
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='absences' AND policyname='allow_all_absences') THEN
    CREATE POLICY allow_all_absences ON absences FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- plannings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='plannings' AND policyname='allow_all_plannings') THEN
    CREATE POLICY allow_all_plannings ON plannings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- recrutements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recrutements' AND policyname='allow_all_recrutements') THEN
    CREATE POLICY allow_all_recrutements ON recrutements FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- demandes_personnel
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='demandes_personnel' AND policyname='allow_all_demandes') THEN
    CREATE POLICY allow_all_demandes ON demandes_personnel FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- uniformes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='uniformes' AND policyname='allow_all_uniformes') THEN
    CREATE POLICY allow_all_uniformes ON uniformes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_empleados_local ON empleados(local);
CREATE INDEX IF NOT EXISTS idx_presences_date_local ON presences(date, local);
CREATE INDEX IF NOT EXISTS idx_absences_local ON absences(local);
CREATE INDEX IF NOT EXISTS idx_plannings_semaine ON plannings(semaine, local);
CREATE INDEX IF NOT EXISTS idx_demandes_local ON demandes_personnel(local);
`;

// ============================================================
// Employees to seed (Cluky's Marif)
// ============================================================
const EMPLOYEES = [
  {nom:"Smail Naceh",poste:"Gerant Matin",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Soufiane Bardaoui",poste:"Gerant Soir",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Imane Najim",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Asmaa Buda",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Yahya Diyab",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Ismail Aasli",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Reda Filali",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Nouhaila Moufrij",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Hatime Alhawari",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Marwane Ghailan",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Zakariya Abd Sadek",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Yahya Elghazi",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Said Bizgaren",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Sami Chabbouk",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Amine",poste:"Polyvalent Cuisine",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Saad Hamoussa",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Marwane Sabri",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Yasser Assal",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Khalid",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Akrame Kendi",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Mohamed",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Yassine Benlmalem",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Yahya Bribri",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Aymane Daifi",poste:"Polyvalent Salle",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Kaltoum Atouzar",poste:"Plonge",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Oussama Fahir",poste:"Plonge",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Nizar",poste:"Operateur Laboratoire",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Jamal",poste:"Operateur Laboratoire",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Chouaibe Tawdi",poste:"Operateur Laboratoire",local:"Cluky's Marif",marque:"Cluky's"},
  {nom:"Mohammed",poste:"Operateur Laboratoire",local:"Cluky's Marif",marque:"Cluky's"},
];

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('=== TIMA GRUPO — Supabase Setup ===\n');

  // Step 1: Create tables via SQL
  console.log('1. Creating tables...');
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  }).catch(() => null);

  // Use the SQL endpoint directly
  const sqlExecRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  console.log('   REST API status:', sqlExecRes.status);
  console.log('   NOTE: Copy the SQL from this file into Supabase SQL Editor to create tables.');
  console.log('   Dashboard > SQL Editor > New Query > Paste > Run\n');

  // Step 2: Seed employees
  console.log('2. Seeding employees (Cluky\'s Marif)...');

  // Check if already seeded
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/empleados?local=eq.Cluky's Marif&select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  if (checkRes.ok) {
    const existing = await checkRes.json();
    if (existing.length > 0) {
      console.log('   Employees already exist, skipping seed.');
    } else {
      // Insert all employees
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/empleados`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(EMPLOYEES.map(e => ({
          ...e,
          date_entree: '2025-01-01',
          actif: true,
          telephone: ''
        })))
      });

      if (insertRes.ok) {
        const inserted = await insertRes.json();
        console.log(`   Inserted ${inserted.length} employees.`);
      } else {
        const err = await insertRes.text();
        console.error('   Insert failed:', insertRes.status, err);
        console.log('   Make sure tables are created first (run SQL in Dashboard).');
      }
    }
  } else {
    const err = await checkRes.text();
    console.error('   Table check failed:', checkRes.status, err);
    console.log('   Tables not yet created. Run the SQL in Supabase Dashboard first.');
  }

  console.log('\n=== Setup complete ===');
  console.log('\nNext steps:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Paste the CREATE_SQL from this file and run it');
  console.log('3. Run this script again to seed employees: node setup-db.js');
  console.log('4. Open index.html in your browser');
}

main().catch(console.error);
