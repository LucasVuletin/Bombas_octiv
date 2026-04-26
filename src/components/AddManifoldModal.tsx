import { useEffect, useState } from "react";
import { MANIFOLD_TYPE_OPTIONS, ManifoldType } from "../models";
import {
  ManifoldFormErrors,
  ManifoldFormValues,
  validateManifoldForm,
} from "../utils/validation";

type AddManifoldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddManifold: (values: { type: ManifoldType; pumpsPerSide: number }) => void;
};

const INITIAL_VALUES: ManifoldFormValues = {
  type: "",
  pumpsPerSide: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{message}</p>;
}

export function AddManifoldModal({
  isOpen,
  onClose,
  onAddManifold,
}: AddManifoldModalProps) {
  const [values, setValues] = useState<ManifoldFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ManifoldFormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setValues(INITIAL_VALUES);
      setErrors({});
      return;
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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit() {
    const validation = validateManifoldForm(values);

    if (!validation.isValid || values.type === "") {
      setErrors(validation.errors);
      return;
    }

    onAddManifold({
      type: values.type,
      pumpsPerSide: validation.parsedPumpsPerSide,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div className="hmi-panel w-full max-w-3xl rounded-[2rem] border-slate-600/70 bg-slate-950/94">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Menu principal
            </p>
            <h2 className="mt-2 text-3xl text-slate-50">Agregar manifold</h2>
            <p className="mt-2 max-w-xl text-base text-slate-300/78">
              Define el tipo y la capacidad por lado para representarlo en el banco
              central del set.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/80 text-2xl text-slate-200 transition hover:border-[#7FB3C8]/40 hover:text-white"
            aria-label="Cerrar modal"
          >
            x
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Tipo de manifold
            </span>
            <select
              value={values.type}
              onChange={(event) => {
                setValues((currentValues) => ({
                  ...currentValues,
                  type: event.target.value as ManifoldType | "",
                }));
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  type: undefined,
                }));
              }}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            >
              <option value="">Seleccionar</option>
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
              Cantidad de bombas por lado
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
              }}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-2xl tracking-[0.08em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
              placeholder="Ej: 8"
            />
            <FieldError message={errors.pumpsPerSide} />
          </label>
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
            onClick={handleSubmit}
            className="min-h-14 rounded-2xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-6 text-base font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
          >
            Agregar manifold
          </button>
        </div>
      </div>
    </div>
  );
}
