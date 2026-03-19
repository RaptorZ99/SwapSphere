import type { ItemSummary } from "@swapsphere/shared";

type ItemCardProps = {
  item: ItemSummary;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

export const ItemCard = ({ item, selectable = false, selected = false, onToggle }: ItemCardProps) => {
  return (
    <article className={`nm-card ${selected ? "nm-card-selected" : ""}`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {/* Category pill floating on image */}
        <span
          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: "var(--nm-bg)",
            color: "var(--nm-text-secondary)",
            boxShadow: "var(--nm-raised-sm)"
          }}
        >
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <h3 className="heading-section line-clamp-1 text-[0.95rem]">{item.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>
          {item.description}
        </p>

        <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--nm-text-tertiary)" }}>
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
            style={{
              background: "var(--nm-accent-soft)",
              color: "var(--nm-accent)"
            }}
          >
            {item.ownerDisplayName.slice(0, 1).toUpperCase()}
          </span>
          <span>{item.ownerDisplayName}</span>
        </div>

        {selectable ? (
          <button
            type="button"
            onClick={onToggle}
            className={`nm-btn mt-1 w-full py-2 text-xs ${selected ? "nm-btn-accent" : ""}`}
          >
            {selected ? "Selectionne ✓" : "Selectionner"}
          </button>
        ) : null}
      </div>
    </article>
  );
};
