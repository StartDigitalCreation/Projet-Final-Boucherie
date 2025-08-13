import { cn } from "@/lib/utils";
import { Category } from "@/context/CartContext";

const defaultOptions: { key: string; label: string }[] = [
  { key: "boeuf", label: "Bœuf" },
  { key: "agneau", label: "Agneau" },
  { key: "volaille", label: "Volaille" },
  { key: "preparations", label: "Préparations" },
];

interface Props {
  value: Category | "toutes";
  onChange: (c: Category | "toutes") => void;
  categories?: { id: string; name: string }[];
}

const CategoryFilter = ({ value, onChange, categories }: Props) => {
  const options = categories 
    ? categories.map(cat => ({ key: cat.id, label: cat.name }))
    : defaultOptions;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("toutes")}
        className={cn(
          "px-3 py-1.5 rounded-md border text-sm transition-colors",
          value === "toutes" 
            ? "bg-primary text-primary-foreground border-primary" 
            : "bg-background hover:bg-accent/20 border-border"
        )}
      >
        Toutes
      </button>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "px-3 py-1.5 rounded-md border text-sm capitalize transition-colors",
            value === o.key 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-background hover:bg-accent/20 border-border"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;