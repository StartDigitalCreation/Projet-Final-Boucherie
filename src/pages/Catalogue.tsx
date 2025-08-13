import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect, useCallback } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import CartDrawer from "@/components/cart/CartDrawer";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import ProductCard from "@/components/catalog/ProductCard";
import type { Product, Category } from "@/context/CartContext";
import { getProducts, getCategories } from "@/lib/supabase";

const Catalogue = () => {
  const [cat, setCat] = useState<Category | "toutes">("toutes");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      // Convertir les produits DB vers le format du catalogue
      const catalogProducts: Product[] = productsData.map(p => ({
        id: p.id,
        nom: p.nom,
        description: p.description,
        prix_kg: p.prix,
        categorie: p.categorie_id,
        image_url: p.image_url
      }));
      
      setAllProducts(catalogProducts);
      
      // Convertir les catégories DB vers le format attendu
      const catalogCategories = categoriesData.map(c => ({
        id: c.id,
        name: c.nom
      }));
      
      setCategories(catalogCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback vers localStorage si Supabase échoue
      const savedProducts = localStorage.getItem('admin_products');
      const savedCategories = localStorage.getItem('admin_categories');
      
      if (savedProducts) {
        try {
          const adminProducts = JSON.parse(savedProducts);
          const catalogProducts: Product[] = adminProducts.map((p: any) => ({
            id: p.id,
            nom: p.name,
            description: p.description,
            prix_kg: p.price,
            categorie: p.category,
            image_url: p.imageUrl
          }));
          setAllProducts(catalogProducts);
        } catch (error) {
          console.error('Erreur lors du chargement des produits depuis localStorage:', error);
        }
      }
      
      if (savedCategories) {
        try {
          const adminCategories = JSON.parse(savedCategories);
          setCategories(adminCategories);
        } catch (error) {
          console.error('Erreur lors du chargement des catégories depuis localStorage:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Charger les données au montage du composant
    loadData();

    // Écouter les changements dans localStorage (fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_products' || e.key === 'admin_categories') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier les changements toutes les 30 secondes
    const interval = setInterval(loadData, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [loadData]);

  const products = useMemo(() => {
    return cat === "toutes" ? allProducts : allProducts.filter(p => p.categorie === cat);
  }, [cat, allProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement du catalogue...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Catalogue | La Boucherie Amandinoise</title>
        <meta name="description" content="Découvrez nos viandes halal: bœuf, agneau, volaille et préparations maison. Ajoutez au panier et retirez en boutique." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/catalogue'} />
      </Helmet>
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="font-display text-3xl">Catalogue</h1>
          <CategoryFilter value={cat} onChange={setCat} categories={categories} />
        </header>
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Liste des produits">
          {products.length > 0 ? (
            products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {cat === "toutes" 
                  ? "Aucun produit disponible. Ajoutez des produits depuis l'admin." 
                  : `Aucun produit dans la catégorie "${categories.find(c => c.id === cat)?.name || cat}".`
                }
              </p>
            </div>
          )}
        </section>
      </main>
      <CartDrawer />
    </div>
  );
};

export default Catalogue;
