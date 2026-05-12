const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  live:      { color: "var(--color-danger)", label: "● LIVE" },
  finished:  { color: "var(--color-fg-dim)", label: "FT" },
  scheduled: { color: "var(--color-fg-mid)", label: "UPCOMING" },
  open:      { color: "var(--color-ok)",     label: "● OPEN" },
  voting:    { color: "var(--color-warn)",   label: "● VOTING" },
  drafting:  { color: "var(--color-accent)", label: "● DRAFTING" },
  playing:   { color: "var(--color-ok)",     label: "● PLAYING" },
};

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    color: "var(--color-fg-mid)",
    label: status,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded-sm border"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "var(--tracking-label)",
        color: cfg.color,
        borderColor: cfg.color + "55",
        background: cfg.color + "12",
      }}
    >
      {cfg.label}
    </span>
  );
}
