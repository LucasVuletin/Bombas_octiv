import { SET_OPTIONS, SetNumber, WellStageContext } from "../models";
import { WellStagePanel } from "./WellStagePanel";

type ControlHeaderProps = {
  selectedSet: SetNumber;
  totalInSet: number;
  operativeInSetCount: number;
  operativeOutOfSetCount: number;
  nonOperativeInSetCount: number;
  nonOperativeOutOfSetCount: number;
  dgbInSetCount: number;
  nonDgbInSetCount: number;
  substitutingDgbInSetCount: number;
  nonSubstitutingDgbInSetCount: number;
  dgbSubstitutionPercentage: number;
  stageContext: WellStageContext;
  onSetChange: (setNumber: SetNumber) => void;
  onStageContextChange: (context: WellStageContext) => void;
  onOpenAddPump: () => void;
  onOpenAddManifold: () => void;
  onSaveLayout: () => void;
  onClearLayout: () => void;
  onDownloadExcel: () => void;
  onToggleFullscreen: () => void;
  isExporting: boolean;
  isFullscreen: boolean;
};

function MetricCard({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-950/45 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-50">
        {value}
        {suffix}
      </p>
    </div>
  );
}

export function ControlHeader({
  selectedSet,
  totalInSet,
  operativeInSetCount,
  operativeOutOfSetCount,
  nonOperativeInSetCount,
  nonOperativeOutOfSetCount,
  dgbInSetCount,
  nonDgbInSetCount,
  substitutingDgbInSetCount,
  nonSubstitutingDgbInSetCount,
  dgbSubstitutionPercentage,
  stageContext,
  onSetChange,
  onStageContextChange,
  onOpenAddPump,
  onOpenAddManifold,
  onSaveLayout,
  onClearLayout,
  onDownloadExcel,
  onToggleFullscreen,
  isExporting,
  isFullscreen,
}: ControlHeaderProps) {
  return (
    <header className="hmi-panel rounded-[2rem] px-5 py-5 md:px-6">
      <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-4xl font-semibold uppercase tracking-[0.34em] text-slate-50">
            OCTIV
          </p>
          <p className="mt-2 text-sm text-slate-300/78">
            Frac layout tactil para operacion local en modo kiosco.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 self-start xl:self-auto">
          <label className="flex items-center gap-3 rounded-[1.5rem] border border-slate-700/70 bg-slate-950/55 px-4 py-3">
            <span className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">
              SET
            </span>
            <select
              value={selectedSet}
              onChange={(event) => onSetChange(Number(event.target.value) as SetNumber)}
              className="min-h-14 rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 text-xl font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            >
              {SET_OPTIONS.map((setNumber) => (
                <option key={setNumber} value={setNumber}>
                  {setNumber}
                </option>
              ))}
            </select>
          </label>

        </div>
      </div>

      <WellStagePanel context={stageContext} onChange={onStageContextChange} />

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenAddPump}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100"
        >
          Agregar bomba
        </button>
        <button
          type="button"
          onClick={onOpenAddManifold}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100"
        >
          Agregar manifold
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100"
        >
          {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
        <button
          type="button"
          onClick={onSaveLayout}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100"
        >
          Guardar layout
        </button>
        <button
          type="button"
          onClick={onClearLayout}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100"
        >
          Limpiar layout
        </button>
        <button
          type="button"
          onClick={onDownloadExcel}
          disabled={isExporting}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-950/80 px-5 text-base font-semibold text-slate-200 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-wait disabled:opacity-55"
        >
          {isExporting ? "Preparando Excel..." : "Descargar Excel"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))]">
        <MetricCard
          label="Bombas en set"
          value={totalInSet}
        />
        <MetricCard
          label="Operativas en set"
          value={operativeInSetCount}
        />
        <MetricCard
          label="Operativas fuera de set"
          value={operativeOutOfSetCount}
        />
        <MetricCard
          label="No operativas en set"
          value={nonOperativeInSetCount}
        />
        <MetricCard
          label="No operativas fuera de set"
          value={nonOperativeOutOfSetCount}
        />
        <MetricCard
          label="Sustitucion DGB"
          value={dgbSubstitutionPercentage}
          suffix="%"
        />
        <MetricCard
          label="Bombas con DGB"
          value={dgbInSetCount}
        />
        <MetricCard
          label="Bombas sin DGB"
          value={nonDgbInSetCount}
        />
        <MetricCard
          label="Bombas sustituyendo"
          value={substitutingDgbInSetCount}
        />
        <MetricCard
          label="Bombas sin sustituir"
          value={nonSubstitutingDgbInSetCount}
        />
      </div>
    </header>
  );
}
