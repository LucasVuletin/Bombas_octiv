import { CONNECTION_META, PumpConnection, PumpSide } from "../models";

type ConnectionLineToneProps = {
  connection: PumpConnection;
  side: Exclude<PumpSide, "bench">;
};

export function ConnectionLineTone({ connection, side }: ConnectionLineToneProps) {
  if (connection === "none") {
    return <div className="h-full" aria-hidden="true" />;
  }

  const meta = CONNECTION_META[connection];
  const manifoldCapSide = side === "left" ? "right-0" : "left-0";
  const pumpCapSide = side === "left" ? "left-0" : "right-0";
  const labelSide = side === "left" ? "right-1" : "left-1";

  return (
    <div className="relative h-full w-full" aria-label={meta.label}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className={`h-1.5 w-full rounded-full ${meta.lineClass}`} />
      </div>
      <div
        className={`absolute ${pumpCapSide} top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${meta.dotClass}`}
      />
      <div
        className={`absolute ${manifoldCapSide} top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-slate-300/85`}
      />
      <span
        className={`absolute ${labelSide} top-2 hidden text-[10px] font-semibold uppercase tracking-[0.2em] ${meta.labelClass} xl:block`}
      >
        {meta.shortLabel}
      </span>
    </div>
  );
}
