import { Link, NavLink } from "react-router-dom";
import logo from "@/assets/logo-ma-boucherie-halal.png";
import { ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3" aria-label="Accueil La Boucherie Amandinoise">
          <img src={logo} alt="Logo La Boucherie Amandinoise, boucherie halal" className="h-8 w-8 md:h-9 md:w-9" loading="lazy" />
          <span className="font-display text-lg md:text-xl font-semibold">La Boucherie Amandinoise</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          <NavLink to="/" className={({isActive}) => isActive ? "text-primary font-medium" : "text-foreground/70 hover:text-foreground transition-colors"}>
            Accueil
          </NavLink>
          <NavLink to="/catalogue" className={({isActive}) => isActive ? "text-primary font-medium" : "text-foreground/70 hover:text-foreground transition-colors"}>
            Catalogue
          </NavLink>
          <NavLink to="/admin/login" className={({isActive}) => isActive ? "text-primary font-medium" : "text-foreground/70 hover:text-foreground transition-colors"}>
            Admin
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/catalogue" className="hidden sm:inline-flex rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition" aria-label="Voir le catalogue">
            Voir le catalogue
          </Link>
          <button id="cart-fab-anchor" aria-label="Ouvrir le panier" className="inline-flex items-center justify-center rounded-md border bg-card px-3 py-2 text-sm shadow hover:bg-accent/20 transition-colors">
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-6">
                <NavLink 
                  to="/" 
                  className={({isActive}) => isActive ? "text-primary font-medium text-lg" : "text-foreground/70 hover:text-foreground text-lg transition-colors"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </NavLink>
                <NavLink 
                  to="/catalogue" 
                  className={({isActive}) => isActive ? "text-primary font-medium text-lg" : "text-foreground/70 hover:text-foreground text-lg transition-colors"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Catalogue
                </NavLink>
                <NavLink 
                  to="/admin/login" 
                  className={({isActive}) => isActive ? "text-primary font-medium text-lg" : "text-foreground/70 hover:text-foreground text-lg transition-colors"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </NavLink>
                <div className="pt-4 border-t">
                  <Link 
                    to="/catalogue" 
                    className="inline-flex w-full rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground shadow hover:opacity-90 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Voir le catalogue
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;