import { useDroppable } from "@dnd-kit/core";
import { Pump } from "../types";
import { createRows } from "../utils/pumpLayout";
import { ConnectionLine } from "./ConnectionLine";
import { Manifold } from "./Manifold";
import { PumpCard } from "./PumpCard";

type LayoutCanvasProps = {
  leftPumps: Pump[];
  rightPumps: Pump[];
  selectedPumpId: string | null;
  onSelectPump: (pumpId: string) => void;
};

function ColumnDropHint({
  title,
  count,
  isOver,
}: {
  title: string;
  count: number;
  isOver: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
          Zona activa
        </p>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <div
        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
          isOver
            ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-100"
            : "border-slate-600/70 bg-slate-900/60 text-slate-300"
        }`}
      >
        {isOver ? "Soltar bomba" : `${count} unidades`}
      </div>
    </div>
  );
}

export function LayoutCanvas({
  leftPumps,
  rightPumps,
  selectedPumpId,
  onSelectPump,
}: LayoutCanvasProps) {
  const { isOver: isLeftOver, setNodeRef: setLeftDropRef } = useDroppable({
    id: "zone-left",
  });
  const { isOver: isRightOver, setNodeRef: setRightDropRef } = useDroppable({
    id: "zone-right",
  });

  const rowCount = Math.max(leftPumps.length, rightPumps.length, 8);
  const leftRows = createRows(leftPumps, rowCount);
  const rightRows = createRows(rightPumps, rowCount);

  return (
    <section className="hmi-panel overflow-hidden rounded-[2rem] p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
            Canvas operativo
          </p>
          <h2 className="text-2xl text-slate-50">Spread activo alrededor del manifold</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-300/75">
            Arrastrá cada unidad hacia la columna izquierda, derecha o fuera del set.
            La línea se dibuja según la conexión seleccionada en el editor.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
          <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
            Línea celeste = limpio
          </span>
          <span className="rounded-full border border-[#9a5f36]/40 bg-[#9a5f36]/15 px-3 py-1 text-[#f3dfcf]">
            Línea marrón = sucio
          </span>
          <span className="rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1 text-slate-300">
            Sin línea = desconectada
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)]">
        <div
          ref={setLeftDropRef}
          className={`rounded-[1.8rem] border p-4 transition ${
            isLeftOver
              ? "border-cyan-300/65 bg-cyan-500/10"
              : "border-slate-700/70 bg-slate-950/35"
          }`}
        >
          <ColumnDropHint title="Columna izquierda" count={leftPumps.length} isOver={isLeftOver} />

          <div className="flex flex-col gap-3">
            {leftRows.map((pump, index) => (
              <div
                key={`left-row-${index}`}
                className="grid h-[6.25rem] grid-cols-[minmax(0,1fr)_8rem] items-center gap-3"
              >
                {pump ? (
                  <PumpCard
                    pump={pump}
                    onSelect={onSelectPump}
                    isSelected={selectedPumpId === pump.id}
                  />
                ) : (
                  <div className="layout-slot">Fila izquierda {index + 1}</div>
                )}
                <ConnectionLine connection={pump?.connection ?? "none"} side="left" />
              </div>
            ))}
          </div>
        </div>

        <Manifold rowCount={rowCount} />

        <div
          ref={setRightDropRef}
          className={`rounded-[1.8rem] border p-4 transition ${
            isRightOver
              ? "border-cyan-300/65 bg-cyan-500/10"
              : "border-slate-700/70 bg-slate-950/35"
          }`}
        >
          <ColumnDropHint title="Columna derecha" count={rightPumps.length} isOver={isRightOver} />

          <div className="flex flex-col gap-3">
            {rightRows.map((pump, index) => (
              <div
                key={`right-row-${index}`}
                className="grid h-[6.25rem] grid-cols-[8rem_minmax(0,1fr)] items-center gap-3"
              >
                <ConnectionLine connection={pump?.connection ?? "none"} side="right" />
                {pump ? (
                  <PumpCard
                    pump={pump}
                    onSelect={onSelectPump}
                    isSelected={selectedPumpId === pump.id}
                  />
                ) : (
                  <div className="layout-slot">Fila derecha {index + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
