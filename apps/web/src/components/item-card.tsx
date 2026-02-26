import type { ItemSummary } from "@swapsphere/shared-types";

type ItemCardProps = {
  item: ItemSummary;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

export const ItemCard = ({ item, selectable = false, selected = false, onToggle }: ItemCardProps) => {
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        selected ? "border-[var(--color-brand-500)] ring-2 ring-[var(--color-brand-200)]" : "border-black/10"
      }`}
    >
      <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover" loading="lazy" />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-black/70">{item.description}</p>
        <div className="flex items-center justify-between text-xs text-black/60">
          <span className="rounded-full bg-black/5 px-2 py-1 font-semibold">{item.category}</span>
          <span>{item.ownerDisplayName}</span>
        </div>
        {selectable ? (
          <button
            type="button"
            onClick={onToggle}
            className={`mt-2 w-full rounded-full px-3 py-2 text-sm font-semibold transition ${
              selected ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            {selected ? "Selectionne" : "Selectionner"}
          </button>
        ) : null}
      </div>
    </article>
  );
};
