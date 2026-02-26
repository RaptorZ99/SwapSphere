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
  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-black/65">{message}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
};
