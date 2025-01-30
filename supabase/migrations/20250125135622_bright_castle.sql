/*
  # Création de la table des administrateurs

  1. Nouvelles Tables
    - `administrators`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (admin_role enum)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key)

  2. Sécurité
    - Enable RLS
    - Policies pour la lecture et l'écriture
*/

-- Création du type enum pour le rôle s'il n'existe pas
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('superadmin', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Création de la table des administrateurs
CREATE TABLE IF NOT EXISTS administrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role admin_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES administrators(id),
  
  CONSTRAINT valid_creator CHECK (
    CASE 
      WHEN role = 'admin' THEN created_by IS NOT NULL
      ELSE true
    END
  )
);

-- Activation de la sécurité niveau ligne
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture
CREATE POLICY "Administrators can view all administrators"
  ON administrators
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour la création
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

-- Insertion du super administrateur initial si n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM administrators 
    WHERE email = 'bayeissaniang@outlook.com'
  ) THEN
    INSERT INTO administrators (email, first_name, last_name, role)
    VALUES (
      'bayeissaniang@outlook.com',
      'Baye Issa',
      'NIANG',
      'superadmin'
    );
  END IF;
END $$;