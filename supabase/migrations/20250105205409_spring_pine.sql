/*
  # Création des tables pour la gestion des livraisons

  1. Nouvelles Tables
    - `delivery_requests`
      - `id` (uuid, clé primaire)
      - `client_id` (uuid, référence à auth.users)
      - `pickup_address` (text, adresse de récupération)
      - `delivery_address` (text, adresse de livraison)
      - `status` (enum: pending, accepted, rejected)
      - `pickup_time` (timestamptz, heure de récupération prévue)
      - `created_at` (timestamptz)
      - `description` (text, description du colis)
  
  2. Sécurité
    - Activation RLS sur la table delivery_requests
    - Politiques pour:
      - Les clients peuvent créer et voir leurs propres demandes
      - L'admin peut voir et modifier toutes les demandes
*/

-- Création du type enum pour le statut
CREATE TYPE delivery_status AS ENUM ('pending', 'accepted', 'rejected');

-- Création de la table des demandes de livraison
CREATE TABLE IF NOT EXISTS delivery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) NOT NULL,
  pickup_address text NOT NULL,
  delivery_address text NOT NULL,
  status delivery_status DEFAULT 'pending',
  pickup_time timestamptz,
  created_at timestamptz DEFAULT now(),
  description text,
  
  CONSTRAINT valid_pickup_time CHECK (
    CASE 
      WHEN status = 'accepted' THEN pickup_time IS NOT NULL 
      ELSE true 
    END
  )
);

-- Activation de la sécurité niveau ligne
ALTER TABLE delivery_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux clients de voir leurs propres demandes
CREATE POLICY "Users can view own requests"
  ON delivery_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Politique pour permettre aux clients de créer des demandes
CREATE POLICY "Users can create requests"
  ON delivery_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Politique pour permettre à l'admin de tout voir et modifier
CREATE POLICY "Admin can do everything"
  ON delivery_requests
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@example.com'
    )
  );