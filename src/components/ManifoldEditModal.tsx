import { useEffect, useState } from "react";
import { MANIFOLD_TYPE_OPTIONS, Manifold, ManifoldType } from "../models";
import {
  ManifoldFormErrors,
  ManifoldFormValues,
  validateManifoldForm,
} from "../utils/validation";

type ManifoldEditModalProps = {
  manifold: Manifold | null;
  onClose: () => void;
  onSave: (manifold: Manifold) => string | null;
};

function getInitialValues(manifold: Manifold | null): ManifoldFormValues {
  return {
    type: manifold?.type ?? "",
    pumpsPerSide: manifold ? String(manifold.pumpsPerSide) : "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{message}</p>;
}

export function ManifoldEditModal({
  manifold,
  onClose,
  onSave,
}: ManifoldEditModalProps) {
  const [values, setValues] = useState<ManifoldFormValues>(getInitialValues(manifold));
  const [errors, setErrors] = useState<ManifoldFormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setValues(getInitialValues(manifold));
    setErrors({});
    setSaveError(null);
  }, [manifold]);

  useEffect(() => {
    if (!manifold) {
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
  }, [manifold, onClose]);

  if (!manifold) {
    return null;
  }

  function handleSave() {
    if (!manifold) {
      return;
    }

    const validation = validateManifoldForm(values);

    if (!validation.isValid || values.type === "") {
      setErrors(validation.errors);
      return;
    }

    const error = onSave({
      ...manifold,
      type: values.type,
      pumpsPerSide: validation.parsedPumpsPerSide,
    });

    setSaveError(error);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/72 p-4 backdrop-blur-sm md:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div className="hmi-panel my-2 w-full max-w-xl rounded-[2rem] border-slate-600/70 bg-slate-950/94 md:my-0">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[2rem] border-b border-slate-800/80 bg-slate-950/95 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Configuracion de manifold
            </p>
            <h2 className="mt-2 text-3xl text-slate-50">{manifold.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/80 text-2xl text-slate-200 transition hover:border-[#7FB3C8]/40 hover:text-white"
            aria-label="Cerrar editor de manifold"
          >
            x
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Nombre visible del manifold
            </span>
            <select
              value={values.type}
              onChange={(event) => {
                setValues((currentValues) => ({
                  ...currentValues,
                  type: event.target.value as ManifoldType,
                }));
                setErrors((currentErrors) => ({ ...currentErrors, type: undefined }));
                setSaveError(null);
              }}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            >
              {MANIFOLD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.type} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Cantidad de slots por lado
            </span>
            <input
              inputMode="numeric"
              value={values.pumpsPerSide}
              onChange={(event) => {
                setValues((currentValues) => ({
                  ...currentValues,
                  pumpsPerSide: event.target.value.replace(/[^\d]/g, "").slice(0, 2),
                }));
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  pumpsPerSide: undefined,
                }));
                setSaveError(null);
              }}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-2xl text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
              placeholder="1 a 40"
            />
            <FieldError message={errors.pumpsPerSide} />
          </label>

          {saveError ? (
            <div className="rounded-[1.2rem] border border-amber-200/20 bg-[#8B6A4A]/14 px-4 py-3 text-sm text-[#F1E0CE]">
              {saveError}
            </div>
          ) : null}
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
            className="min-h-14 rounded-2xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-6 text-base font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
          >
            Guardar manifold
          </button>
        </div>
      </div>
    </div>
  );
}
