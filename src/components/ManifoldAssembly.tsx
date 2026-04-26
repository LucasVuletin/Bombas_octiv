import { useDroppable } from "@dnd-kit/core";
import { ConnectionLineTone } from "./ConnectionLineTone";
import { PumpUnitCard } from "./PumpUnitCard";
import { createSlotDropId, ManifoldSlot } from "../utils/layoutState";
import { MANIFOLD_TYPE_META, Manifold, Pump } from "../models";

type PumpSlotProps = {
  manifold: Manifold;
  onSelectPump: (pumpId: string) => void;
  pump: Pump | null;
  position: number;
  selectedPumpId: string | null;
  side: "left" | "right";
};

function PumpSlot({
  manifold,
  pump,
  position,
  side,
  selectedPumpId,
  onSelectPump,
}: PumpSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: createSlotDropId({
      manifoldId: manifold.id,
      position,
      side,
    }),
  });

  const connection =
    !pump || pump.connection === "none" ? "none" : manifold.type;

  const slotBody = pump ? (
    <PumpUnitCard
      pump={pump}
      onSelect={onSelectPump}
      isSelected={selectedPumpId === pump.id}
    />
  ) : (
    <div
      className={`layout-slot h-[9.25rem] border-slate-600/60 bg-slate-950/24 text-slate-400 transition ${
        isOver ? "border-[#7FB3C8]/55 bg-[#7FB3C8]/8 text-slate-200" : ""
      }`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">
          Slot {position}
        </p>
        <p className="mt-1 text-sm text-inherit">Disponible</p>
      </div>
    </div>
  );
  const lineWrapperClass =
    side === "left"
      ? "absolute right-[-5.7rem] top-0 h-full w-[5.2rem]"
      : "absolute left-[-5.7rem] top-0 h-full w-[5.2rem]";

  return (
    <div
      ref={setNodeRef}
      className={`relative overflow-visible rounded-[1.65rem] border p-2 transition ${
        isOver
          ? "border-[#7FB3C8]/50 bg-[#7FB3C8]/8"
          : "border-slate-700/55 bg-slate-950/18"
      }`}
    >
      <div className="relative">{slotBody}</div>

      {pump ? (
        <div className={lineWrapperClass}>
          <ConnectionLineTone connection={connection} side={side} />
        </div>
      ) : null}
    </div>
  );
}

type ManifoldAssemblyProps = {
  leftSlots: ManifoldSlot[];
  manifold: Manifold;
  onSelectPump: (pumpId: string) => void;
  rightSlots: ManifoldSlot[];
  selectedPumpId: string | null;
};

export function ManifoldAssembly({
  manifold,
  leftSlots,
  rightSlots,
  onSelectPump,
  selectedPumpId,
}: ManifoldAssemblyProps) {
  const typeMeta = MANIFOLD_TYPE_META[manifold.type];

  return (
    <article className="rounded-[2rem] border border-slate-700/60 bg-slate-950/28 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            {manifold.label}
          </p>
          <h3 className="mt-1 text-2xl text-slate-50">{typeMeta.label}</h3>
        </div>

        <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${typeMeta.accentClass}`}>
          {manifold.pumpsPerSide} slots por lado
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)]">
        <div className="space-y-3">
          {leftSlots.map((slot) => (
            <PumpSlot
              key={`${manifold.id}-left-${slot.position}`}
              manifold={manifold}
              pump={slot.pump}
              position={slot.position}
              side="left"
              selectedPumpId={selectedPumpId}
              onSelectPump={onSelectPump}
            />
          ))}
        </div>

        <div className="relative flex min-h-full items-stretch justify-center">
          <div className="absolute inset-y-2 left-1/2 w-[52px] -translate-x-1/2 rounded-full border border-slate-700/65 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(12,19,31,0.98)_100%)]" />
          <div className="absolute inset-y-7 left-1/2 w-px -translate-x-1/2 bg-slate-700/70" />

          <div className="relative z-10 flex min-h-full flex-col items-center justify-between py-6">
            <span className={`h-4 w-4 rounded-full ${typeMeta.chipClass}`} />
            <div className="rounded-[1.35rem] border border-slate-700/60 bg-slate-950/55 px-3 py-4">
              <p className="vertical-label text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                MANIFOLD
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Espacios
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-50">{manifold.pumpsPerSide}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rightSlots.map((slot) => (
            <PumpSlot
              key={`${manifold.id}-right-${slot.position}`}
              manifold={manifold}
              pump={slot.pump}
              position={slot.position}
              side="right"
              selectedPumpId={selectedPumpId}
              onSelectPump={onSelectPump}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
