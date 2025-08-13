import { useEffect, useId, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { addOrder, addOrderProducts } from "@/lib/supabase";

const CartDrawer = () => {
  const { items, updateQuantity, removeItem, total, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    prenom: "",
    nom: "",
    telephone: ""
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = useId();

  useEffect(() => {
    const anchor = document.getElementById("cart-fab-anchor");
    const handler = () => setOpen(true);
    anchor?.addEventListener("click", handler);
    return () => anchor?.removeEventListener("click", handler);
  }, []);

  const handleValidate = async () => {
    if (!customerInfo.prenom || !customerInfo.nom || !customerInfo.telephone) {
      setShowCustomerForm(true);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Créer la commande
      const order = await addOrder({
        client_prenom: customerInfo.prenom,
        client_nom: customerInfo.nom,
        telephone: customerInfo.telephone,
        statut: 'En attente',
        payee: true, // Marquer comme payé par défaut pour les tests
        total: total
      });

      // Ajouter les produits de la commande
      const orderProducts = items.map(item => ({
        commande_id: order.id,
        produit_id: item.product.id,
        quantite: item.quantity,
        nom: item.product.nom,
        prix: item.product.prix_kg
      }));

      try {
        await addOrderProducts(orderProducts);
      } catch (error) {
        console.warn('Erreur lors de l\'ajout des produits, mais la commande a été créée:', error);
      }

      toast.success(
        `Commande ${order.id.slice(0, 8)} enregistrée`,
        {
          description: `Total: ${total.toFixed(2)}€ - Retrait en boutique dans 30 minutes`,
        }
      );
      
      clear();
      setCustomerInfo({ prenom: "", nom: "", telephone: "" });
      setShowCustomerForm(false);
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error("Erreur lors de l'enregistrement de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickOrder = () => {
    if (items.length === 0) return;
    
    // Commande rapide sans informations client (pour demo)
    const orderNo = `CMD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    toast.success(
      `Commande ${orderNo} enregistrée (retrait en boutique)`,
      {
        description: "Votre commande sera prête dans 30 minutes.",
      }
    );
    clear();
    setOpen(false);
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);

  const increaseQuantity = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  return (
    <>
      {/* FAB panier visible en permanence */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:opacity-90 transition"
        aria-label="Ouvrir le panier"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm font-medium">{count}</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <span id={id} />
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col w-[92vw] sm:w-[420px] max-w-full">
          <SheetHeader>
            <SheetTitle>Votre panier</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="space-y-3 pb-4 border-b last:border-b-0">
                  <div className="flex items-start gap-3">
                    <img 
                      src={product.image_url} 
                      alt={`Aperçu ${product.nom}`} 
                      className="h-16 w-16 rounded object-cover flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight text-sm">{product.nom}</p>
                      <p className="text-xs text-muted-foreground">{product.prix_kg.toFixed(2)} € / kg</p>
                      <p className="text-sm font-medium mt-1">{(quantity * product.prix_kg).toFixed(2)} €</p>
                    </div>
                    <button 
                      onClick={() => removeItem(product.id)} 
                      aria-label={`Supprimer ${product.nom}`} 
                      className="rounded-md border p-2 hover:bg-accent/20 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quantité (kg)</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => decreaseQuantity(product.id, quantity)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        onChange={(e) => updateQuantity(product.id, Number(e.target.value) || 1)}
                        className="w-16 h-8 text-center text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => increaseQuantity(product.id, quantity)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <SheetFooter className="mt-4 border-t pt-4">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              
              {showCustomerForm ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      placeholder="Prénom"
                      value={customerInfo.prenom}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, prenom: e.target.value }))}
                    />
                    <Input
                      placeholder="Nom"
                      value={customerInfo.nom}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, nom: e.target.value }))}
                    />
                    <Input
                      placeholder="Téléphone"
                      value={customerInfo.telephone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={handleValidate}
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enregistrement..." : "Confirmer la commande"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCustomerForm(false)}
                      size="lg"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    disabled={items.length === 0} 
                    onClick={handleValidate}
                    size="lg"
                  >
                    Valider la commande (retrait)
                  </Button>
                </div>
              )}
              
              {items.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={clear}
                  size="sm"
                >
                  Vider le panier
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartDrawer;