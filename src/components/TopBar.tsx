type TopBarProps = {
  totalInSet: number;
  operativeCount: number;
  stoppedCount: number;
  benchCount: number;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
};

function MetricCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: number;
  accentClass: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-950/45 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}

export function TopBar({
  totalInSet,
  operativeCount,
  stoppedCount,
  benchCount,
  onReset,
  onToggleFullscreen,
  isFullscreen,
}: TopBarProps) {
  return (
    <header className="hmi-panel rounded-[2rem] px-5 py-5 md:px-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3">
            <img src="/icons/H.png" alt="Logo" className="h-8 w-8" />
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/75">
              Halliburton Argentina | Frac spread HMI
            </p>
          </div>
          <h1 className="mt-2 text-3xl text-slate-50 md:text-4xl">
            Layout táctil de bombas de fractura
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-300/80">
            Tocar una unidad abre el editor manual. Arrastrar el mango lateral la mueve
            entre izquierda, derecha y fuera del set. El estado queda persistido en el
            navegador del equipo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="min-h-14 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 text-base font-semibold text-cyan-50 transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
          >
            {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-14 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-5 text-base font-semibold text-rose-50 transition hover:border-rose-300/35 hover:bg-rose-500/15"
          >
            Reset layout
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <MetricCard
          label="Bombas en set"
          value={totalInSet}
          accentClass="text-cyan-100"
        />
        <MetricCard
          label="Operativas"
          value={operativeCount}
          accentClass="text-emerald-300"
        />
        <MetricCard
          label="Detenidas"
          value={stoppedCount}
          accentClass="text-slate-200"
        />
        <MetricCard
          label="Fuera del set"
          value={benchCount}
          accentClass="text-amber-200"
        />

        <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-950/45 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Referencias rápidas
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
              Limpio
            </span>
            <span className="rounded-full border border-[#9a5f36]/40 bg-[#9a5f36]/15 px-3 py-1 text-[#f2ddd0]">
              Sucio
            </span>
            <span className="rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1 text-slate-300">
              Sin línea
            </span>
            <span className="rounded-full border border-orange-300/25 bg-orange-500/10 px-3 py-1 text-orange-100">
              Alerta
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
