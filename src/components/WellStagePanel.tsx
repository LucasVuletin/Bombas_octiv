import { WellStageContext, WellStageEntry, WellStageMode } from "../models";

type WellStagePanelProps = {
  context: WellStageContext;
  onChange: (context: WellStageContext) => void;
};

type WellStageField = keyof WellStageEntry;

function ContextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
      />
    </label>
  );
}

export function WellStagePanel({ context, onChange }: WellStagePanelProps) {
  function updatePad(value: string) {
    onChange({
      ...context,
      pad: value,
    });
  }

  function updateEntry(entry: "primary" | "secondary", field: WellStageField, value: string) {
    onChange({
      ...context,
      [entry]: {
        ...context[entry],
        [field]: value,
      },
    });
  }

  function updateMode(mode: WellStageMode) {
    onChange({
      ...context,
      mode,
    });
  }

  return (
    <section className="mt-5 rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Trazabilidad
          </p>
          <h2 className="mt-1 text-xl text-slate-50">Pozo y etapa</h2>
        </div>

        <label className="block min-w-[12rem]">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Modalidad
          </span>
          <select
            aria-label="Modalidad de pozo y etapa"
            value={context.mode}
            onChange={(event) => updateMode(event.target.value as WellStageMode)}
            className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
          >
            <option value="single">Zipper</option>
            <option value="dual-simul">Dual / Simul</option>
          </select>
        </label>
      </div>

      <div className={`grid gap-3 ${context.mode === "dual-simul" ? "md:grid-cols-5" : "md:grid-cols-3"}`}>
        <ContextInput
          label="Pad"
          value={context.pad ?? ""}
          onChange={updatePad}
          placeholder="Nombre del pad"
        />
        <ContextInput
          label="Pozo 1"
          value={context.primary.well}
          onChange={(value) => updateEntry("primary", "well", value)}
          placeholder="Nombre del pozo"
        />
        <ContextInput
          label="Etapa 1"
          value={context.primary.stage}
          onChange={(value) => updateEntry("primary", "stage", value)}
          placeholder="Etapa"
        />

        {context.mode === "dual-simul" ? (
          <>
            <ContextInput
              label="Pozo 2"
              value={context.secondary.well}
              onChange={(value) => updateEntry("secondary", "well", value)}
              placeholder="Segundo pozo"
            />
            <ContextInput
              label="Etapa 2"
              value={context.secondary.stage}
              onChange={(value) => updateEntry("secondary", "stage", value)}
              placeholder="Etapa"
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
