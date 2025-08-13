import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/layout/SiteHeader";
import PromoBanner from "@/components/layout/PromoBanner";
import CartDrawer from "@/components/cart/CartDrawer";
import hero from "@/assets/hero-boucherie.jpg";
import { Link } from "react-router-dom";
import { UtensilsCrossed, BadgePercent, Truck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>La Boucherie Amandinoise | Viandes halal de qualité</title>
        <meta name="description" content="Boucherie halal à emporter: bœuf, agneau, volaille, préparations maison. Commandez en ligne et retirez en boutique." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
      </Helmet>
      <PromoBanner />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative">
          <img src={hero} alt="Comptoir de boucherie halal avec viandes fraîches" className="h-[60vh] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
          <div className="container absolute inset-0 flex items-center">
            <div className="max-w-xl space-y-4">
              <h1 className="font-display text-4xl md:text-5xl leading-tight">La Boucherie Amandinoise</h1>
              <p className="text-muted-foreground text-base md:text-lg">Viandes halal sélectionnées avec soin: bœuf, agneau, volaille et préparations maison. Commandez en ligne et retirez en boutique.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/catalogue" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-primary-foreground font-medium shadow-lg hover:opacity-90 transition">
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Points forts */}
        <section className="container py-12 grid md:grid-cols-3 gap-6" aria-labelledby="points-forts">
          <h2 id="points-forts" className="sr-only">Points forts</h2>
          <div className="rounded-xl border p-6 shadow-[var(--shadow-elegant)] bg-card">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">Qualité sélectionnée</h3>
            <p className="text-sm text-muted-foreground">Des pièces choisies avec exigence auprès de partenaires certifiés halal.</p>
          </div>
          <div className="rounded-xl border p-6 shadow-[var(--shadow-elegant)] bg-card">
            <BadgePercent className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">Promos régulières</h3>
            <p className="text-sm text-muted-foreground">Découvrez chaque semaine nos offres sur l'agneau et les préparations.</p>
          </div>
          <div className="rounded-xl border p-6 shadow-[var(--shadow-elegant)] bg-card">
            <Truck className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">Retrait rapide</h3>
            <p className="text-sm text-muted-foreground">Commandez en ligne, récupérez en boutique au créneau de votre choix.</p>
          </div>
        </section>

        {/* Promotions */}
        <section id="contact" className="bg-secondary border-y">
          <div className="container py-10 text-center space-y-4">
            <h2 className="font-display text-2xl">Nous trouver</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>434 Rue Henri Durre</p>
              <p>59230 Saint Amand Les Eaux</p>
              <p>Tél: 07 77 25 79 20</p>
              <p>Ouvert du lundi au dimanche, 8h-19h</p>
            </div>
          </div>
        </section>
      </main>
      <CartDrawer />
    </div>
  );
};

export default Index;