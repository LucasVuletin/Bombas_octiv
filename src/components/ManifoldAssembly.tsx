import { useDroppable } from "@dnd-kit/core";
import { ConnectionLineTone } from "./ConnectionLineTone";
import { PumpUnitCard } from "./PumpUnitCard";
import {
  createSlotActuatorKey,
  createSlotDropId,
  ManifoldSlot,
  SlotActuatorMap,
  SlotTarget,
} from "../utils/layoutState";
import { MANIFOLD_TYPE_META, Manifold, Pump } from "../models";

type PumpSlotProps = {
  manifold: Manifold;
  onAddPumpToSlot: (target: SlotTarget) => void;
  onSelectPump: (pumpId: string) => void;
  onSlotActuatorChange: (target: SlotTarget, value: string) => void;
  pump: Pump | null;
  position: number;
  selectedPumpId: string | null;
  side: "left" | "right";
  slotActuators: SlotActuatorMap;
};

function PumpSlot({
  manifold,
  pump,
  position,
  side,
  selectedPumpId,
  slotActuators,
  onAddPumpToSlot,
  onSelectPump,
  onSlotActuatorChange,
}: PumpSlotProps) {
  const slotTarget = {
    manifoldId: manifold.id,
    position,
    side,
  };
  const { isOver, setNodeRef } = useDroppable({
    id: createSlotDropId(slotTarget),
  });

  const slotActuatorValue = slotActuators[createSlotActuatorKey(slotTarget)] ?? "";
  const connection = pump
    ? pump.connection === "none"
      ? "none"
      : manifold.type
    : manifold.type;

  const slotBody = pump ? (
    <PumpUnitCard
      pump={pump}
      onSelect={onSelectPump}
      isSelected={selectedPumpId === pump.id}
    />
  ) : (
    <button
      type="button"
      onClick={() =>
        onAddPumpToSlot(slotTarget)
      }
      aria-label={`Agregar bomba en slot ${position} del lado ${side === "left" ? "izquierdo" : "derecho"}`}
      className={`layout-slot h-[10.5rem] w-full border-slate-600/60 bg-slate-950/24 text-slate-400 transition hover:border-[#7FB3C8]/45 hover:bg-[#7FB3C8]/8 hover:text-slate-100 xl:h-[11.25rem] ${
        isOver ? "border-[#7FB3C8]/55 bg-[#7FB3C8]/8 text-slate-200" : ""
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-600/70 bg-slate-950/42 text-3xl font-light leading-none text-slate-200">
        +
      </span>
    </button>
  );
  const lineWrapperClass =
    side === "left"
      ? "absolute right-[-1.2rem] top-0 h-full w-[1.45rem] md:right-[-2.6rem] md:w-[2.85rem] xl:right-[-5.7rem] xl:w-[5.95rem]"
      : "absolute left-[-1.2rem] top-0 h-full w-[1.45rem] md:left-[-2.6rem] md:w-[2.85rem] xl:left-[-5.7rem] xl:w-[5.95rem]";
  const actuatorInputPositionClass =
    side === "left"
      ? "left-0.5 translate-x-0 xl:left-1/2 xl:-translate-x-1/2"
      : "right-0.5 translate-x-0 xl:right-auto xl:left-1/2 xl:-translate-x-1/2";

  return (
    <div
      ref={setNodeRef}
      className={`relative overflow-visible rounded-[1.75rem] transition ${
        isOver ? "ring-2 ring-[#7FB3C8]/50" : ""
      }`}
    >
      <div className="relative">{slotBody}</div>

      <div className={`${lineWrapperClass} pointer-events-none`}>
        <ConnectionLineTone connection={connection} side={side} />
        <input
          aria-label={`Actuadores asignados en slot ${position} del lado ${
            side === "left" ? "izquierdo" : "derecho"
          }`}
          autoComplete="off"
          inputMode="numeric"
          maxLength={3}
          onChange={(event) => onSlotActuatorChange(slotTarget, event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onFocus={(event) => event.currentTarget.select()}
          onPointerDown={(event) => event.stopPropagation()}
          placeholder="0"
          title="Actuadores asignados"
          value={slotActuatorValue}
          className={`pointer-events-auto absolute top-1/2 z-20 h-7 w-8 -translate-y-1/2 rounded-lg border border-slate-600/70 bg-slate-950/90 px-1 text-center text-[0.65rem] font-black leading-none text-slate-50 shadow-[0_10px_24px_rgba(2,6,23,0.55)] outline-none transition placeholder:text-slate-500 focus:border-[#7FB3C8]/70 focus:ring-2 focus:ring-[#7FB3C8]/25 sm:h-8 sm:w-10 sm:text-xs xl:w-12 ${actuatorInputPositionClass}`}
        />
      </div>
    </div>
  );
}

type ManifoldAssemblyProps = {
  leftSlots: ManifoldSlot[];
  manifold: Manifold;
  onAddPumpToSlot: (target: SlotTarget) => void;
  onEditManifold: (manifoldId: string) => void;
  onSelectPump: (pumpId: string) => void;
  onSlotActuatorChange: (target: SlotTarget, value: string) => void;
  rightSlots: ManifoldSlot[];
  selectedPumpId: string | null;
  slotActuators: SlotActuatorMap;
};

export function ManifoldAssembly({
  manifold,
  leftSlots,
  rightSlots,
  onAddPumpToSlot,
  onEditManifold,
  onSelectPump,
  onSlotActuatorChange,
  selectedPumpId,
  slotActuators,
}: ManifoldAssemblyProps) {
  const typeMeta = MANIFOLD_TYPE_META[manifold.type];
  const manifoldPumps = [...leftSlots, ...rightSlots].flatMap((slot) =>
    slot.pump ? [slot.pump] : [],
  );
  const operativePumpCount = manifoldPumps.filter(
    (pump) => pump.operationState === "operative",
  ).length;
  const nonOperativePumpCount = manifoldPumps.filter(
    (pump) => pump.operationState === "non-operative",
  ).length;

  return (
    <article className="rounded-none border-x-0 border-slate-700/60 bg-slate-950/28 p-0 sm:rounded-[2rem] sm:border-x sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-3 pt-3 sm:mb-4 sm:px-0 sm:pt-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h3 className="text-2xl text-slate-50">{typeMeta.label}</h3>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-xs font-semibold text-emerald-100 sm:text-sm">
            Operativas {operativePumpCount}
          </span>
          <span className="rounded-full border border-red-400/20 bg-red-400/8 px-3 py-1 text-xs font-semibold text-red-100 sm:text-sm">
            No operativas {nonOperativePumpCount}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEditManifold(manifold.id)}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-slate-500/70 hover:text-white"
        >
          Editar
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] gap-0.5 sm:grid-cols-[minmax(0,1fr)_3.8rem_minmax(0,1fr)] sm:gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)] xl:gap-4">
        <div className="space-y-1.5 sm:space-y-3">
          {leftSlots.map((slot) => (
            <PumpSlot
              key={`${manifold.id}-left-${slot.position}`}
              manifold={manifold}
              pump={slot.pump}
              position={slot.position}
              side="left"
              selectedPumpId={selectedPumpId}
              slotActuators={slotActuators}
              onAddPumpToSlot={onAddPumpToSlot}
              onSelectPump={onSelectPump}
              onSlotActuatorChange={onSlotActuatorChange}
            />
          ))}
        </div>

        <div className="relative flex min-h-full items-stretch justify-center">
          <div className="absolute inset-y-2 left-1/2 w-4 -translate-x-1/2 rounded-full border border-slate-700/65 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(12,19,31,0.98)_100%)] sm:w-8 xl:w-[52px]" />
          <div className="absolute inset-y-7 left-1/2 w-px -translate-x-1/2 bg-slate-700/70" />
        </div>

        <div className="space-y-1.5 sm:space-y-3">
          {rightSlots.map((slot) => (
            <PumpSlot
              key={`${manifold.id}-right-${slot.position}`}
              manifold={manifold}
              pump={slot.pump}
              position={slot.position}
              side="right"
              selectedPumpId={selectedPumpId}
              slotActuators={slotActuators}
              onAddPumpToSlot={onAddPumpToSlot}
              onSelectPump={onSelectPump}
              onSlotActuatorChange={onSlotActuatorChange}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
