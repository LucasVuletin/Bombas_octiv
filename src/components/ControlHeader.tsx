import {
  PUMP_SIGNAL_COLUMN_OPTIONS,
  PumpSignalColumnCount,
  SET_OPTIONS,
  SetNumber,
} from "../models";

type ControlHeaderProps = {
  selectedSet: SetNumber;
  signalColumnCount: PumpSignalColumnCount;
  totalInSet: number;
  operativeInSetCount: number;
  operativeOutOfSetCount: number;
  nonOperativeInSetCount: number;
  nonOperativeOutOfSetCount: number;
  dgbSubstitutionPercentage: number;
  onSetChange: (setNumber: SetNumber) => void;
  onSignalColumnCountChange: (columnCount: PumpSignalColumnCount) => void;
  onOpenAddPump: () => void;
  onOpenAddManifold: () => void;
  onSaveLayout: () => void;
  onClearLayout: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
};

function MetricCard({
  label,
  value,
  accentClass,
  suffix = "",
}: {
  label: string;
  value: number;
  accentClass: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-950/45 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${accentClass}`}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

export function ControlHeader({
  selectedSet,
  signalColumnCount,
  totalInSet,
  operativeInSetCount,
  operativeOutOfSetCount,
  nonOperativeInSetCount,
  nonOperativeOutOfSetCount,
  dgbSubstitutionPercentage,
  onSetChange,
  onSignalColumnCountChange,
  onOpenAddPump,
  onOpenAddManifold,
  onSaveLayout,
  onClearLayout,
  onToggleFullscreen,
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

          <label className="flex items-center gap-3 rounded-[1.5rem] border border-slate-700/70 bg-slate-950/55 px-4 py-3">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              P/D/S
            </span>
            <select
              value={signalColumnCount}
              onChange={(event) =>
                onSignalColumnCountChange(Number(event.target.value) as PumpSignalColumnCount)
              }
              className="min-h-14 rounded-2xl border border-slate-700/70 bg-slate-900/85 px-4 text-lg font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            >
              {PUMP_SIGNAL_COLUMN_OPTIONS.map((columnCount) => (
                <option key={columnCount} value={columnCount}>
                  {columnCount} columnas
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenAddPump}
          className="min-h-14 rounded-2xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-5 text-base font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
        >
          Agregar bomba
        </button>
        <button
          type="button"
          onClick={onOpenAddManifold}
          className="min-h-14 rounded-2xl border border-[#8B6A4A]/35 bg-[#8B6A4A]/12 px-5 text-base font-semibold text-slate-50 transition hover:border-[#8B6A4A]/55 hover:bg-[#8B6A4A]/16"
        >
          Agregar manifold
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="min-h-14 rounded-2xl border border-slate-600/70 bg-slate-900/85 px-5 text-base font-semibold text-slate-100 transition hover:border-slate-500/70 hover:text-white"
        >
          {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
        <button
          type="button"
          onClick={onSaveLayout}
          className="min-h-14 rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-5 text-base font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-500/16"
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
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(0,1fr))]">
        <MetricCard
          label="Bombas en set"
          value={totalInSet}
          accentClass="text-slate-100"
        />
        <MetricCard
          label="Operativas en set"
          value={operativeInSetCount}
          accentClass="text-emerald-300"
        />
        <MetricCard
          label="Operativas fuera de set"
          value={operativeOutOfSetCount}
          accentClass="text-emerald-200"
        />
        <MetricCard
          label="No operativas en set"
          value={nonOperativeInSetCount}
          accentClass="text-[#E8D4BE]"
        />
        <MetricCard
          label="No operativas fuera de set"
          value={nonOperativeOutOfSetCount}
          accentClass="text-amber-100"
        />
        <MetricCard
          label="Sustitucion DGB"
          value={dgbSubstitutionPercentage}
          suffix="%"
          accentClass="text-[#B8D0DB]"
        />
      </div>
    </header>
  );
}
