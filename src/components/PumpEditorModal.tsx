import { useEffect, useState } from "react";
import {
  CONNECTION_OPTIONS,
  CONNECTION_META,
  PUMP_STATUS_META,
  Pump,
  PumpConnection,
  PumpStatus,
  SIDE_LABELS,
  STATUS_OPTIONS,
} from "../types";

type PumpEditorModalProps = {
  pump: Pump | null;
  onClose: () => void;
  onSave: (pump: Pump) => void;
};

export function PumpEditorModal({ pump, onClose, onSave }: PumpEditorModalProps) {
  const [draft, setDraft] = useState<Pump | null>(pump);

  useEffect(() => {
    setDraft(pump ? { ...pump } : null);
  }, [pump]);

  useEffect(() => {
    if (!pump) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, pump]);

  if (!draft || !pump) {
    return null;
  }

  const statusMeta = PUMP_STATUS_META[draft.status];

  function updateDraft<Key extends keyof Pump>(key: Key, value: Pump[Key]) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [key]: value,
          }
        : currentDraft,
    );
  }

  function handleSave() {
    if (!draft || !pump) {
      return;
    }

    onSave({
      ...draft,
      unitNumber: draft.unitNumber.trim() || pump.unitNumber,
      notes: draft.notes.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pump-editor-title"
        className="hmi-panel w-full max-w-4xl rounded-[2rem] border-slate-600/70 bg-slate-950/92"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
              Editor táctil de unidad
            </p>
            <h2 id="pump-editor-title" className="mt-1 text-3xl text-slate-50">
              Unidad {pump.unitNumber}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <span className="rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1 text-slate-200">
                {SIDE_LABELS[draft.side]}
              </span>
              <span
                className={`rounded-full border px-3 py-1 ${statusMeta.pillClass}`}
              >
                {statusMeta.shortLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/85 text-2xl text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            aria-label="Cerrar editor"
          >
            ×
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Número de unidad
              </span>
              <input
                value={draft.unitNumber}
                onChange={(event) => updateDraft("unitNumber", event.target.value)}
                className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-3xl tracking-[0.2em] text-slate-50 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                placeholder="Ej: 8725"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Estado operativo
              </span>
              <select
                value={draft.status}
                onChange={(event) =>
                  updateDraft("status", event.target.value as PumpStatus)
                }
                className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
              >
                {STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Conexión al manifold
              </span>
              <div className="grid gap-3 md:grid-cols-3">
                {CONNECTION_OPTIONS.map((connectionOption) => {
                  const meta = CONNECTION_META[connectionOption.value];
                  const isActive = draft.connection === connectionOption.value;

                  return (
                    <button
                      key={connectionOption.value}
                      type="button"
                      onClick={() =>
                        updateDraft("connection", connectionOption.value as PumpConnection)
                      }
                      className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                        isActive
                          ? `${meta.pillClass} ring-2 ring-cyan-300/40`
                          : "border-slate-700/70 bg-slate-900/80 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-3.5 w-3.5 rounded-full ${meta.dotClass}`} />
                        <span className="text-sm font-semibold uppercase tracking-[0.22em]">
                          {meta.shortLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300/75">{meta.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Notas operativas
              </span>
              <textarea
                value={draft.notes}
                onChange={(event) => updateDraft("notes", event.target.value)}
                className="min-h-40 w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/25"
                placeholder="Observaciones, fallas, comentarios de set, etc."
              />
            </label>
          </div>

          <aside className="rounded-[1.6rem] border border-slate-700/70 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Resumen de la unidad
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <div className="rounded-[1.25rem] border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Posición actual
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-50">
                  {SIDE_LABELS[draft.side]}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Estado seleccionado
                </p>
                <p className="mt-2 text-lg text-slate-50">{statusMeta.label}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Reglas visuales
                </p>
                <p className="mt-2 leading-6 text-slate-300/80">
                  Si la bomba está en bench no dibuja línea al manifold. Si está en
                  layout y la conexión es desconectada, permanece en el set pero sin
                  línea.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-14 rounded-2xl border border-slate-700/70 bg-slate-900/85 px-6 text-base font-semibold text-slate-200 transition hover:border-slate-500/70 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="min-h-14 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-6 text-base font-semibold text-cyan-50 transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
