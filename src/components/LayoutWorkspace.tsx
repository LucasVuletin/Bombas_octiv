import { Manifold, Pump } from "../models";
import { buildManifoldSlots } from "../utils/layoutState";
import { ManifoldAssembly } from "./ManifoldAssembly";

type LayoutWorkspaceProps = {
  manifolds: Manifold[];
  notice?: string | null;
  pumps: Pump[];
  selectedPumpId: string | null;
  onSelectPump: (pumpId: string) => void;
};

export function LayoutWorkspace({
  manifolds,
  pumps,
  notice = null,
  selectedPumpId,
  onSelectPump,
}: LayoutWorkspaceProps) {
  return (
    <section className="hmi-panel overflow-hidden rounded-[2rem] p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Canvas operativo
          </p>
          <h2 className="text-2xl text-slate-50">Spread activo por manifold y slots</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-300/75">
            Cada manifold se representa como una estructura separada con slots reales a
            izquierda y derecha. Puedes dejar huecos libres o insertar una bomba en un
            slot ocupado para correr la cadena siguiente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
          <span className="rounded-full border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-3 py-1 text-slate-100">
            Linea limpia
          </span>
          <span className="rounded-full border border-[#8B6A4A]/35 bg-[#8B6A4A]/12 px-3 py-1 text-slate-100">
            Linea sucia
          </span>
          <span className="rounded-full border border-slate-600/70 bg-slate-900/60 px-3 py-1 text-slate-300">
            Sin linea
          </span>
        </div>
      </div>

      {notice ? (
        <div className="mb-5 rounded-[1.35rem] border border-amber-200/20 bg-[#8B6A4A]/14 px-4 py-3 text-sm text-[#F1E0CE]">
          {notice}
        </div>
      ) : null}

      <div className="space-y-5">
        {manifolds.map((manifold) => (
          <ManifoldAssembly
            key={manifold.id}
            manifold={manifold}
            leftSlots={buildManifoldSlots(manifolds, pumps, manifold.id, "left")}
            rightSlots={buildManifoldSlots(manifolds, pumps, manifold.id, "right")}
            selectedPumpId={selectedPumpId}
            onSelectPump={onSelectPump}
          />
        ))}
      </div>
    </section>
  );
}
