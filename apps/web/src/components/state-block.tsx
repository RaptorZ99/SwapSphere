type StateBlockProps = {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export const StateBlock = ({ title, message, action }: StateBlockProps) => {
  const isLoading = title.toLowerCase().includes("chargement");

  return (
    <section className="nm-raised p-10 text-center animate-in">
      {isLoading ? (
        <div className="mx-auto mb-5 flex items-center justify-center">
          <div
            className="h-10 w-10 rounded-full"
            style={{
              border: "3px solid var(--nm-shadow-dark)",
              borderTopColor: "var(--nm-accent)",
              animation: "spin 0.8s linear infinite"
            }}
          />
        </div>
      ) : null}

      <h2 className="heading-display text-xl">{title}</h2>
      <p className="mt-3 text-sm" style={{ color: "var(--nm-text-secondary)" }}>{message}</p>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className="nm-btn nm-btn-accent mt-6 px-6 py-2.5 text-sm"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
};
