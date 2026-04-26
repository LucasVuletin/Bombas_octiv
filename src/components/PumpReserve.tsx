import { useDroppable } from "@dnd-kit/core";
import { Pump } from "../models";
import { PumpUnitCard } from "./PumpUnitCard";

type PumpReserveProps = {
  pumps: Pump[];
  selectedPumpId: string | null;
  onSelectPump: (pumpId: string) => void;
};

export function PumpReserve({ pumps, selectedPumpId, onSelectPump }: PumpReserveProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "zone-bench",
  });

  return (
    <section
      ref={setNodeRef}
      className={`hmi-panel bench-pattern rounded-[2rem] p-4 md:p-6 transition ${
        isOver ? "border-[#7FB3C8]/55 bg-[#7FB3C8]/10" : ""
      }`}
    >
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Reserva
          </p>
          <h2 className="text-2xl text-slate-50">Bombas disponibles / fuera del set</h2>
          <p className="mt-1 text-sm text-slate-300/75">
            Toda bomba soltada fuera del layout activo vuelve a esta zona.
          </p>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
            isOver
              ? "border-[#7FB3C8]/50 bg-[#7FB3C8]/12 text-slate-50"
              : "border-slate-600/70 bg-slate-900/60 text-slate-300"
          }`}
        >
          {isOver ? "Soltar bomba en reserva" : `${pumps.length} disponibles`}
        </div>
      </div>

      {pumps.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {pumps.map((pump) => (
            <PumpUnitCard
              key={pump.id}
              pump={pump}
              onSelect={onSelectPump}
              isSelected={selectedPumpId === pump.id}
            />
          ))}
        </div>
      ) : (
        <div className="layout-slot h-28">No hay bombas disponibles en reserva</div>
      )}
    </section>
  );
}
