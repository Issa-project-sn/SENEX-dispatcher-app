/*
  # Création de la table des administrateurs

  1. Nouvelle Table
    - `administrators`
      - `id` (uuid, clé primaire)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (enum: superadmin, admin)
      - `created_at` (timestamp)
      - `created_by` (uuid, référence à administrators.id)

  2. Sécurité
    - Active RLS sur la table administrators
    - Ajoute des politiques pour:
      - Lecture: administrateurs authentifiés uniquement
      - Création: super admin uniquement
*/

-- Création du type enum pour le rôle
CREATE TYPE admin_role AS ENUM ('superadmin', 'admin');

-- Création de la table des administrateurs
CREATE TABLE IF NOT EXISTS administrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role admin_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES administrators(id),
  
  -- Contrainte pour s'assurer que seul le super admin peut créer d'autres admins
  CONSTRAINT valid_creator CHECK (
    CASE 
      WHEN role = 'admin' THEN created_by IS NOT NULL
      ELSE true
    END
  )
);

-- Activation de la sécurité niveau ligne
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux administrateurs de voir tous les administrateurs
CREATE POLICY "Administrators can view all administrators"
  ON administrators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM administrators a
      WHERE a.id = auth.uid()
    )
  );

-- Politique pour permettre au super admin de créer d'autres administrateurs
CREATE POLICY "Super admin can create administrators"
  ON administrators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM administrators a
      WHERE a.id = auth.uid()
      AND a.role = 'superadmin'
    )
  );

-- Insertion du super administrateur initial
INSERT INTO administrators (id, email, first_name, last_name, role)
VALUES (
  gen_random_uuid(),
  'bayeissaniang@outlook.com',
  'Baye Issa',
  'NIANG',
  'superadmin'
);