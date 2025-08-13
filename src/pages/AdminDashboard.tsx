import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import { useEffect, useState, useCallback, useMemo } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Euro,
  Plus,
  Camera,
  Link as LinkIcon,
  Trash2,
  Edit,
  X
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { 
  getCategories, 
  addCategory, 
  deleteCategory,
  getProducts,
  addProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  markOrderAsPaid,
  type Category as DBCategory,
  type Product as DBProduct,
  type Order as DBOrder
} from "@/lib/supabase";

// Types pour l'interface
interface UIOrder {
  id: string;
  customerName: string;
  phone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  paid: boolean;
  date: string;
}

const AdminDashboard = () => {
  const nav = useNavigate();
  const addProductTitleId = React.useId();
  const addCategoryTitleId = React.useId();
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    stock: ""
  });
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [imageCapture, setImageCapture] = useState(false);

  // Charger les données depuis Supabase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, ordersData] = await Promise.all([
        getCategories(),
        getProducts(),
        getOrders()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
      
      // Convertir les commandes DB en format UI (pour l'instant, données mock)
      const uiOrders: UIOrder[] = ordersData.map(order => ({
        id: order.id,
        customerName: `${order.client_prenom} ${order.client_nom}`,
        phone: order.telephone,
        items: [], // Les produits de commande seront chargés séparément si nécessaire
        total: order.total,
        status: order.statut === 'Récupérée' ? 'completed' : 'pending',
        paid: order.payee || false,
        date: order.created_at || new Date().toISOString()
      }));
      
      setOrders(uiOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh dashboard when new orders arrive
  const refreshDashboard = useCallback(() => {
    const checkForNewOrders = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error("Erreur lors de la vérification des nouvelles commandes:", error);
      }
    };
    
    const interval = setInterval(checkForNewOrders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      nav("/admin/login");
      return;
    }

    // Charger les données initiales
    loadData();
    
    // Configurer l'auto-refresh
    const cleanup = refreshDashboard();
    return cleanup;
  }, [nav, refreshDashboard, loadData]);

  const handleSignOut = () => {
    localStorage.removeItem("admin_logged_in");
    nav("/admin/login");
  };

  const validateOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Récupérée');
      await loadData(); // Recharger les données
      toast.success("Commande validée");
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error("Erreur lors de la validation de la commande");
    }
  };

  const markAsPaid = async (orderId: string) => {
    try {
      await markOrderAsPaid(orderId);
      await loadData(); // Recharger les données
      toast.success("Commande marquée comme payée");
    } catch (error) {
      console.error('Erreur lors du marquage comme payé:', error);
      toast.error("Erreur lors du marquage comme payé");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock) || 0;

    if (isNaN(price) || price <= 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }

    if (stock < 0) {
      toast.error("Le stock ne peut pas être négatif");
      return;
    }

    try {
      const productData = {
        nom: newProduct.name.trim(),
        description: newProduct.description.trim(),
        prix: price,
        categorie_id: newProduct.category,
        image_url: newProduct.imageUrl.trim() || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
        stock
      };

      await addProduct(productData);
      await loadData(); // Recharger les données
      setNewProduct({ name: "", description: "", price: "", category: "", imageUrl: "", stock: "" });
      setShowAddProduct(false);
      toast.success("Produit ajouté avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast.error("Erreur lors de l'ajout du produit");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    if (categories.some(cat => cat.nom.toLowerCase() === newCategory.name.toLowerCase())) {
      toast.error("Cette catégorie existe déjà");
      return;
    }

    try {
      await addCategory(newCategory.name.trim());
      await loadData(); // Recharger les données
      setNewCategory({ name: "" });
      setShowAddCategory(false);
      toast.success("Catégorie ajoutée avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      await loadData(); // Recharger les données
      toast.success("Produit supprimé");
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error("Erreur lors de la suppression du produit");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category is used by products
    const isUsed = products.some(p => p.categorie_id === categoryId);
    if (isUsed) {
      toast.error("Impossible de supprimer une catégorie utilisée par des produits");
      return;
    }

    try {
      await deleteCategory(categoryId);
      await loadData(); // Recharger les données
      toast.success("Catégorie supprimée");
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  const handleImageCapture = () => {
    // In a real app, this would open camera
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(stream => {
        toast.success("Caméra activée");
        // Here you would handle the camera stream
        // For now, we'll just stop the stream
        stream.getTracks().forEach(track => track.stop());
        // In a real implementation, you would:
        // 1. Show camera preview
        // 2. Allow user to take photo
        // 3. Convert to base64 or upload to server
        // 4. Set the image URL in the form
      })
      .catch(() => {
        toast.error("Impossible d'accéder à la caméra");
      });
  };

  // Calculs des statistiques
  const currentOrders = useMemo(() => orders.filter(order => order.status === "pending"), [orders]);
  const completedOrders = useMemo(() => orders.filter(order => order.status === "completed"), [orders]);
  const totalSales = useMemo(() => {
    const paidOrders = orders.filter(order => order.paid === true);
    console.log('Commandes payées:', paidOrders);
    return paidOrders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin | La Boucherie Amandinoise</title>
        <meta name="description" content="Gestion des produits et des commandes pour l'administrateur." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/admin'} />
      </Helmet>
      <SiteHeader />
      <main className="container py-4 md:py-8 space-y-6 md:space-y-8">
        <header className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl">Tableau de bord</h1>
            <p className="text-muted-foreground text-sm md:text-base">Gestion des commandes et des produits</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
            Se déconnecter
          </Button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales.toFixed(2)}€</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="analytics" className="hidden lg:block">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Commandes en cours ({currentOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">{order.customerName} - {order.phone}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {!order.paid && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAsPaid(order.id)}
                              className="w-full sm:w-auto"
                            >
                              Marquer payé
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => validateOrder(order.id)}
                            className="w-full sm:w-auto"
                          >
                            Valider
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex gap-2">
                          <Badge variant={order.paid ? "default" : "secondary"}>
                            {order.paid ? "Payé" : "Non payé"}
                          </Badge>
                        </div>
                        <span className="font-semibold">Total: {order.total.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                  {currentOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucune commande en cours</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Commandes terminées ({completedOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3 opacity-75">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">{order.customerName} - {order.phone}</p>
                        </div>
                        <Badge variant="default">Terminé</Badge>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <Badge variant="default">Payé</Badge>
                        <span className="font-semibold">Total: {order.total.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                  {completedOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucune commande terminée</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gestion des produits
                  </span>
                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter un produit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-labelledby={addProductTitleId}>
                      <DialogHeader>
                        <DialogTitle id={addProductTitleId}>Ajouter un produit</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Nom du produit *</Label>
                          <Input
                            id="product-name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Côte de bœuf"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-description">Description</Label>
                          <Textarea
                            id="product-description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description du produit"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-price">Prix (€/kg) *</Label>
                          <Input
                            id="product-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-category">Catégorie *</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-stock">Stock (kg)</Label>
                          <Input
                            id="product-stock"
                            type="number"
                            min="0"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleImageCapture}
                              className="flex items-center gap-2"
                            >
                              <Camera className="h-4 w-4" />
                              Prendre photo
                            </Button>
                            <div className="flex-1">
                              <Input
                                value={newProduct.imageUrl}
                                onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="URL de l'image (optionnel)"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Si aucune image n'est fournie, une image par défaut sera utilisée.
                          </p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">Ajouter</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map(product => (
                    <Card key={product.id} className="relative">
                      <CardContent className="p-4">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">{product.nom}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{product.prix.toFixed(2)}€/kg</span>
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.id === product.categorie_id)?.nom}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {product.stock} kg
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gestion des catégories</span>
                  <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter une catégorie
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" aria-labelledby={addCategoryTitleId}>
                      <DialogHeader>
                        <DialogTitle id={addCategoryTitleId}>Ajouter une catégorie</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddCategory} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">Nom de la catégorie *</Label>
                          <Input
                            id="category-name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ name: e.target.value })}
                            placeholder="Ex: Porc, Charcuterie..."
                            required
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">Ajouter</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map(category => (
                    <Card key={category.id} className="relative">
                      <CardContent className="p-4">
                        <div className="absolute top-2 right-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">{category.nom}</h3>
                          <p className="text-sm text-muted-foreground">
                            {products.filter(p => p.categorie_id === category.id).length} produit(s)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Aucune catégorie. Ajoutez-en une pour commencer.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analyses des ventes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ventes aujourd'hui</p>
                      <p className="text-2xl font-bold">{totalSales.toFixed(2)}€</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Commandes aujourd'hui</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Dashboard mis à jour automatiquement toutes les 30 secondes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;