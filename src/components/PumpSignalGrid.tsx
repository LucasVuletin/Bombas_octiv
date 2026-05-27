import {
  PUMP_SIGNAL_KEYS,
  PUMP_SIGNAL_LABELS,
  PumpSignalColumnCount,
  PumpSignals,
} from "../models";

type PumpSignalGridProps = {
  className?: string;
  columnCount: PumpSignalColumnCount;
  compact?: boolean;
  signals: PumpSignals;
};

export function PumpSignalGrid({
  columnCount,
  signals,
  compact = false,
  className = "",
}: PumpSignalGridProps) {
  const valueClass = compact
    ? "text-[10px] sm:text-sm xl:text-base"
    : "text-sm";
  const labelClass = compact
    ? "text-[10px] sm:text-xs xl:text-sm"
    : "text-sm";
  const gapClass =
    compact && columnCount === 5 ? "gap-x-0.5 md:gap-x-1" : "gap-x-1.5 md:gap-x-2";
  const rowClass =
    columnCount === 5
      ? compact
        ? "grid-cols-[1rem_repeat(5,minmax(0,1fr))]"
        : "grid-cols-[1.2rem_repeat(5,minmax(0,1fr))]"
      : compact
        ? "grid-cols-[1.1rem_repeat(3,minmax(0,1fr))]"
        : "grid-cols-[1.2rem_repeat(3,minmax(0,1fr))]";

  return (
    <div
      className={[
        "min-w-0",
        className,
      ].join(" ")}
    >
      <div className={compact ? "space-y-1.5 xl:space-y-2" : "space-y-1"}>
        {PUMP_SIGNAL_KEYS.map((signalKey) => (
          <div
            key={signalKey}
            className={`grid items-center ${gapClass} ${rowClass} leading-tight`}
          >
            <span className={`font-semibold uppercase tracking-[0.08em] text-slate-50 md:tracking-[0.14em] ${labelClass}`}>
              {PUMP_SIGNAL_LABELS[signalKey]}
            </span>
            {Array.from({ length: columnCount }, (_, index) => (
              <span
                key={`${signalKey}-${index}`}
                className={`text-center font-mono font-semibold tabular-nums leading-none text-slate-50 ${valueClass}`}
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
