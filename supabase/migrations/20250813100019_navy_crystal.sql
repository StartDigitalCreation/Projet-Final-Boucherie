/*
  # Create commande_produits table

  1. New Tables
    - `commande_produits`
      - `commande_id` (uuid, foreign key to commandes)
      - `produit_id` (uuid, foreign key to produits)
      - `quantite` (integer, quantity of product)
      - `nom` (text, product name snapshot)
      - `prix` (numeric, product price snapshot)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `commande_produits` table
    - Add policies for public access (read/write for everyone)

  3. Constraints
    - Primary key on (commande_id, produit_id)
    - Foreign key constraints with CASCADE delete
    - Check constraints for positive quantity and price
*/

CREATE TABLE IF NOT EXISTS public.commande_produits (
    commande_id uuid NOT NULL,
    produit_id uuid NOT NULL,
    quantite integer NOT NULL,
    nom text NOT NULL,
    prix numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.commande_produits ADD CONSTRAINT commande_produits_pkey PRIMARY KEY (commande_id, produit_id);

ALTER TABLE public.commande_produits ADD CONSTRAINT commande_produits_commande_id_fkey 
    FOREIGN KEY (commande_id) REFERENCES public.commandes(id) ON DELETE CASCADE;

ALTER TABLE public.commande_produits ADD CONSTRAINT commande_produits_produit_id_fkey 
    FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE CASCADE;

ALTER TABLE public.commande_produits ADD CONSTRAINT commande_produits_quantite_check 
    CHECK (quantite > 0);

ALTER TABLE public.commande_produits ADD CONSTRAINT commande_produits_prix_check 
    CHECK (prix > 0::numeric);

ALTER TABLE public.commande_produits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order products are viewable by everyone"
    ON public.commande_produits
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Order products are insertable by everyone"
    ON public.commande_produits
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Order products are updatable by everyone"
    ON public.commande_produits
    FOR UPDATE
    TO public
    USING (true);

CREATE POLICY "Order products are deletable by everyone"
    ON public.commande_produits
    FOR DELETE
    TO public
    USING (true);