import { cn } from "@/lib/utils";
import type { Rarity } from "@/types/game";

export type ShopCategory = "all" | "pack" | "item" | "cosmetic";
export type ShopSort = "featured" | "price-asc" | "price-desc" | "name-asc" | "rarity-desc";

export interface ShopFilterState {
  search?: string;
  category?: ShopCategory;
  rarity?: Rarity | "all";
  featuredOnly?: boolean;
}

export interface ShopFiltersProps {
  filters: ShopFilterState;
  sort: ShopSort;
  onChange: (next: ShopFilterState) => void;
  onSortChange: (sort: ShopSort) => void;
  className?: string;
}

const CATEGORIES: Array<{ value: ShopCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "pack", label: "Packs" },
  { value: "item", label: "Items" },
  { value: "cosmetic", label: "Cosmetics" },
];

const RARITIES: Array<{ value: Rarity | "all"; label: string }> = [
  { value: "all", label: "Any" },
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
  { value: "mythic", label: "Mythic" },
];

const SORTS: Array<{ value: ShopSort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rarity-desc", label: "Rarity" },
  { value: "name-asc", label: "Name" },
];

export function ShopFiltersPanel({
  filters,
  sort,
  onChange,
  onSortChange,
  className,
}: ShopFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <SearchInput
        value={filters.search ?? ""}
        onChange={(search) => onChange({ ...filters, search })}
      />

      <FilterGroup label="Category">
        <ChipRow>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              active={(filters.category ?? "all") === c.value}
              onClick={() => onChange({ ...filters, category: c.value })}
            >
              {c.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <FilterGroup label="Rarity">
        <ChipRow>
          {RARITIES.map((r) => (
            <Chip
              key={r.value}
              active={(filters.rarity ?? "all") === r.value}
              onClick={() => onChange({ ...filters, rarity: r.value })}
            >
              {r.label}
            </Chip>
          ))}
        </ChipRow>
      </FilterGroup>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <input
            type="checkbox"
            className="accent-primary"
            checked={!!filters.featuredOnly}
            onChange={(e) => onChange({ ...filters, featuredOnly: e.target.checked })}
          />
          Featured only
        </label>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ShopSort)}
            className="rounded-sm border border-border bg-surface-1 px-2 py-1 font-mono text-xs uppercase tracking-widest text-foreground"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        {label}
      </div>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest transition",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border bg-surface-1/80 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search shop…"
      className="w-full rounded-sm border border-border bg-surface-1 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
    />
  );
}
