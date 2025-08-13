import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addItem } = useCart();
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <img
          src={product.image_url}
          alt={`Viande halal ${product.nom} - ${product.categorie}`}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-1">
        <h3 className="font-medium text-base leading-tight">{product.nom}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <p className="text-lg font-semibold text-primary">{product.prix_kg.toFixed(2)} € / kg</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full flex items-center gap-2" 
          onClick={() => addItem(product)} 
          aria-label={`Ajouter ${product.nom} au panier`}
        >
          <Plus className="h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;