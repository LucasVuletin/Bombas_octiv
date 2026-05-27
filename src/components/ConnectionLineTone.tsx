import { CONNECTION_META, PumpConnection, PumpSide } from "../models";

type ConnectionLineToneProps = {
  connection: PumpConnection;
  side: Exclude<PumpSide, "bench">;
};

export function ConnectionLineTone({ connection }: ConnectionLineToneProps) {
  if (connection === "none") {
    return <div className="h-full" aria-hidden="true" />;
  }

  const meta = CONNECTION_META[connection];

  return (
    <div className="relative h-full w-full" aria-label={meta.label}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className={`h-1.5 w-full rounded-full ${meta.lineClass}`} />
      </div>
    </div>
  );
}
