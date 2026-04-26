import { useDroppable } from "@dnd-kit/core";
import { Pump } from "../types";
import { PumpCard } from "./PumpCard";

type PumpBenchProps = {
  pumps: Pump[];
  selectedPumpId: string | null;
  onSelectPump: (pumpId: string) => void;
};

export function PumpBench({ pumps, selectedPumpId, onSelectPump }: PumpBenchProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "zone-bench",
  });

  return (
    <section
      ref={setNodeRef}
      className={`hmi-panel bench-pattern rounded-[2rem] p-4 md:p-6 transition ${
        isOver ? "border-cyan-300/60 bg-cyan-400/10" : ""
      }`}
    >
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Reserva / banco
          </p>
          <h2 className="text-2xl text-slate-50">Bombas disponibles / fuera del set</h2>
          <p className="mt-1 text-sm text-slate-300/75">
            Toda bomba soltada fuera del layout activo vuelve a esta zona.
          </p>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
            isOver
              ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-100"
              : "border-slate-600/70 bg-slate-900/60 text-slate-300"
          }`}
        >
          {isOver ? "Soltar bomba en bench" : `${pumps.length} disponibles`}
        </div>
      </div>

      {pumps.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {pumps.map((pump) => (
            <PumpCard
              key={pump.id}
              pump={pump}
              onSelect={onSelectPump}
              isSelected={selectedPumpId === pump.id}
            />
          ))}
        </div>
      ) : (
        <div className="layout-slot h-28">No hay bombas disponibles en bench</div>
      )}
    </section>
  );
}
