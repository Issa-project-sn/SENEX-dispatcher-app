import { createClient } from '@supabase/supabase-js';

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies. Assurez-vous de cliquer sur le bouton "Connect to Supabase" en haut à droite.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);