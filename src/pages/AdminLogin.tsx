import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple password check
    if (password === "1980") {
      localStorage.setItem("admin_logged_in", "true");
      toast.success("Connexion réussie", { description: "Bienvenue dans l'admin." });
      nav("/admin");
    } else {
      toast.error("Mot de passe incorrect", { description: "Veuillez réessayer." });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Helmet>
        <title>Connexion Admin | La Boucherie Amandinoise</title>
        <meta name="description" content="Espace administrateur pour gérer produits et commandes." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/admin/login'} />
      </Helmet>
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-[var(--shadow-elegant)] space-y-4">
        <h1 className="font-display text-2xl">Connexion Admin</h1>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="password">Mot de passe</label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Entrez le mot de passe"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
        <Link to="/" className="block">
          <Button type="button" variant="outline" className="w-full">
            Retour au menu
          </Button>
        </Link>
      </form>
    </div>
  );
};

export default AdminLogin;