import { PUMP_SIGNAL_COLUMNS, PUMP_SIGNAL_KEYS, PUMP_SIGNAL_LABELS, PumpSignals } from "../models";

type PumpSignalGridProps = {
  className?: string;
  compact?: boolean;
  signals: PumpSignals;
};

export function PumpSignalGrid({
  signals,
  compact = false,
  className = "",
}: PumpSignalGridProps) {
  const valueClass = compact
    ? "text-[10px]"
    : "text-sm";
  const rowClass = compact
    ? "grid-cols-[0.8rem_repeat(3,minmax(0,1fr))]"
    : "grid-cols-[1.2rem_repeat(3,minmax(0,1fr))]";

  return (
    <div
      className={[
        "min-w-0",
        className,
      ].join(" ")}
    >
      <div className="space-y-1">
        {PUMP_SIGNAL_KEYS.map((signalKey) => (
          <div
            key={signalKey}
            className={`grid items-center gap-x-2 ${rowClass} leading-tight`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {PUMP_SIGNAL_LABELS[signalKey]}
            </span>
            {Array.from({ length: PUMP_SIGNAL_COLUMNS }, (_, index) => (
              <span
                key={`${signalKey}-${index}`}
                className={`text-center font-mono font-semibold tabular-nums leading-none text-[#D9B5B5] ${valueClass}`}
              >
                {signals[signalKey]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
