import { MANIFOLD_TYPE_META, Manifold } from "../models";

type ManifoldBankProps = {
  manifolds: Manifold[];
  rowCount: number;
};

function ManifoldSlots({
  slotClass,
  pumpsPerSide,
}: {
  slotClass: string;
  pumpsPerSide: number;
}) {
  const visibleSlots = Math.min(pumpsPerSide, 6);
  const overflowCount = pumpsPerSide - visibleSlots;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: visibleSlots }, (_, index) => (
        <span
          key={`slot-${index}`}
          className={`h-3 w-1.5 rounded-full ${slotClass}`}
          aria-hidden="true"
        />
      ))}
      {overflowCount > 0 ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/70">
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

export function ManifoldBank({ manifolds, rowCount }: ManifoldBankProps) {
  const minimumHeight = Math.max(rowCount * 112, 640);

  return (
    <div
      className="hmi-panel relative overflow-hidden rounded-[2rem] border-slate-700/70 bg-slate-950/72 px-4 py-5"
      style={{ minHeight: `${minimumHeight}px` }}
    >
      <div className="absolute inset-y-8 left-1/2 w-[44px] -translate-x-1/2 rounded-full border border-slate-700/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(17,24,39,0.96)_100%)]" />
      <div className="absolute inset-y-12 left-1/2 w-px -translate-x-1/2 bg-slate-700/70" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Banco central
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-50">Manifolds activos</h3>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-1 pb-2">
          {manifolds.map((manifold) => {
            const typeMeta = MANIFOLD_TYPE_META[manifold.type];

            return (
              <article
                key={manifold.id}
                className={`rounded-[1.35rem] border px-3 py-4 ${typeMeta.accentClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300/70">
                      {manifold.label}
                    </p>
                    <h4 className="mt-1 text-lg text-slate-50">{typeMeta.label}</h4>
                  </div>
                  <span className={`h-3.5 w-3.5 rounded-full ${typeMeta.chipClass}`} />
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-300/72">
                  {manifold.pumpsPerSide} bombas por lado
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <ManifoldSlots
                    slotClass={typeMeta.slotClass}
                    pumpsPerSide={manifold.pumpsPerSide}
                  />
                  <ManifoldSlots
                    slotClass={typeMeta.slotClass}
                    pumpsPerSide={manifold.pumpsPerSide}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
