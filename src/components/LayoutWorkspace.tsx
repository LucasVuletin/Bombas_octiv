import { Manifold, Pump } from "../models";
import { buildManifoldSlots, SlotActuatorMap, SlotTarget } from "../utils/layoutState";
import { ManifoldAssembly } from "./ManifoldAssembly";

type LayoutWorkspaceProps = {
  manifolds: Manifold[];
  notice?: string | null;
  pumps: Pump[];
  selectedPumpId: string | null;
  slotActuators: SlotActuatorMap;
  onAddPumpToSlot: (target: SlotTarget) => void;
  onEditManifold: (manifoldId: string) => void;
  onSelectPump: (pumpId: string) => void;
  onSlotActuatorChange: (target: SlotTarget, value: string) => void;
};

export function LayoutWorkspace({
  manifolds,
  pumps,
  notice = null,
  selectedPumpId,
  slotActuators,
  onAddPumpToSlot,
  onEditManifold,
  onSelectPump,
  onSlotActuatorChange,
}: LayoutWorkspaceProps) {
  return (
    <section className="hmi-panel -mx-4 overflow-hidden rounded-none border-x-0 p-0 sm:mx-0 sm:rounded-[2rem] sm:border-x sm:p-4 md:p-6">
      {notice ? (
        <div className="mx-2 mb-5 rounded-[1.35rem] border border-amber-200/20 bg-[#8B6A4A]/14 px-4 py-3 text-sm text-[#F1E0CE] sm:mx-0">
          {notice}
        </div>
      ) : null}

      <div className="space-y-3 sm:space-y-5">
        {manifolds.map((manifold) => (
          <ManifoldAssembly
            key={manifold.id}
            manifold={manifold}
            leftSlots={buildManifoldSlots(manifolds, pumps, manifold.id, "left")}
            rightSlots={buildManifoldSlots(manifolds, pumps, manifold.id, "right")}
            selectedPumpId={selectedPumpId}
            slotActuators={slotActuators}
            onAddPumpToSlot={onAddPumpToSlot}
            onEditManifold={onEditManifold}
            onSelectPump={onSelectPump}
            onSlotActuatorChange={onSlotActuatorChange}
          />
        ))}
      </div>
    </section>
  );
}
