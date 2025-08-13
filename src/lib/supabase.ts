import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Types pour les données
export interface Category {
  id: string;
  nom: string;
  created_at?: string;
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;
  categorie_id: string;
  image_url: string;
  stock: number;
  featured?: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  client_nom: string;
  client_prenom: string;
  telephone: string;
  statut: 'En attente' | 'En préparation' | 'Prête' | 'Récupérée';
  payee: boolean;
  total: number;
  date_commande?: string;
  created_at?: string;
}

export interface OrderProduct {
  commande_id: string;
  produit_id: string;
  quantite: number;
  nom: string;
  prix: number;
  created_at?: string;
}

// Fonctions pour les catégories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('nom');
  
  if (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
  
  return data || [];
};

export const addCategory = async (nom: string): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ nom }])
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de l\'ajout de la catégorie:', error);
    throw error;
  }
  
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    throw error;
  }
};

// Fonctions pour les produits
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('produits')
    .select('*')
    .order('nom');
  
  if (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
  
  return data || [];
};

export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('produits')
    .insert([product])
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de l\'ajout du produit:', error);
    throw error;
  }
  
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('produits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
  
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('produits')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

// Fonctions pour les commandes
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('commandes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw error;
  }
  
  return data || [];
};

export const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'date_commande'>): Promise<Order> => {
  console.log('Création de commande:', order);
  
  const { data, error } = await supabase
    .from('commandes')
    .insert([order])
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de l\'ajout de la commande:', error);
    throw error;
  }
  
  console.log('Commande créée avec succès:', data);
  return data;
};

export const updateOrderStatus = async (id: string, statut: Order['statut']): Promise<Order> => {
  const { data, error } = await supabase
    .from('commandes')
    .update({ statut })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
  
  return data;
};

export const markOrderAsPaid = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('commandes')
    .update({ payee: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors du marquage comme payé:', error);
    throw error;
  }
  
  return data;
};

// Fonctions pour les produits de commande
export const addOrderProducts = async (orderProducts: Omit<OrderProduct, 'created_at'>[]): Promise<void> => {
  const { error } = await supabase
    .from('commande_produits')
    .insert(orderProducts);
  
  if (error) {
    console.warn('Supabase operation failed for commande_produits, using localStorage fallback:', error);
    // Fallback: sauvegarder dans localStorage
    const existingOrderProducts = JSON.parse(localStorage.getItem('orderProducts') || '[]');
    const newOrderProducts = [...existingOrderProducts, ...orderProducts];
    localStorage.setItem('orderProducts', JSON.stringify(newOrderProducts));
  }
};

export const getOrderProducts = async (orderId: string): Promise<OrderProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('commande_produits')
      .select('*')
      .eq('commande_id', orderId);
    
    if (error) {
      console.error('Erreur lors de la récupération des produits de commande:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.warn('Table commande_produits non trouvée, utilisation du localStorage comme fallback');
    // Fallback: récupérer depuis localStorage
    const orderProducts = JSON.parse(localStorage.getItem('orderProducts') || '[]');
    return orderProducts.filter((op: OrderProduct) => op.commande_id === orderId);
  }
};