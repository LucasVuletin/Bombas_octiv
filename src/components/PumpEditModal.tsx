import { useEffect, useState } from "react";
import { CONNECTION_META, Pump, PumpNonOperationalReason, SIDE_LABELS } from "../models";
import { PumpFormFields } from "./PumpFormFields";
import {
  PumpFormErrors,
  PumpFormValues,
  normalizeSapInput,
  validatePumpForm,
} from "../utils/validation";

type PumpEditModalProps = {
  pump: Pump | null;
  onClose: () => void;
  onSave: (pump: Pump) => string | null;
};

function getInitialValues(pump: Pump | null): PumpFormValues {
  if (!pump) {
    return {
      sap: "",
      operationState: "",
      nonOperationalReason: "",
      position: "",
      connection: "none",
      pValue: "",
      dValue: "",
      sValue: "",
    };
  }

  return {
    sap: pump.sap,
    operationState: pump.operationState,
    nonOperationalReason: pump.nonOperationalReason ?? "",
    position: String(pump.position),
    connection: pump.connection,
    pValue: String(pump.signals.p),
    dValue: String(pump.signals.d),
    sValue: String(pump.signals.s),
  };
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-700/70 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg text-slate-50">{value}</p>
    </div>
  );
}

export function PumpEditModal({ pump, onClose, onSave }: PumpEditModalProps) {
  const [values, setValues] = useState<PumpFormValues>(getInitialValues(pump));
  const [errors, setErrors] = useState<PumpFormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setValues(getInitialValues(pump));
    setErrors({});
    setSaveError(null);
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

  if (!pump) {
    return null;
  }

  function updateField<Key extends keyof PumpFormValues>(
    field: Key,
    value: PumpFormValues[Key],
  ) {
    setValues((currentValues) => {
      const nextValues: PumpFormValues = {
        ...currentValues,
      };

      if (field === "sap") {
        nextValues.sap = normalizeSapInput(String(value));
        return nextValues;
      }

      if (field === "position") {
        nextValues.position = String(value).replace(/[^\d]/g, "").slice(0, 2);
        return nextValues;
      }

      if (field === "pValue") {
        nextValues.pValue = String(value).replace(/[^\d]/g, "").slice(0, 3);
        return nextValues;
      }

      if (field === "dValue") {
        nextValues.dValue = String(value).replace(/[^\d]/g, "").slice(0, 3);
        return nextValues;
      }

      if (field === "sValue") {
        nextValues.sValue = String(value).replace(/[^\d]/g, "").slice(0, 3);
        return nextValues;
      }

      if (field === "operationState" && value !== "non-operative") {
        nextValues.operationState = value as PumpFormValues["operationState"];
        nextValues.nonOperationalReason = "";
        return nextValues;
      }

      nextValues[field] = value;
      return nextValues;
    });

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setSaveError(null);
  }

  function handleSave() {
    if (!pump) {
      return;
    }

    const validation = validatePumpForm(values);

    if (!validation.isValid || values.operationState === "") {
      setErrors(validation.errors);
      return;
    }

    const error = onSave({
      ...pump,
      sap: values.sap,
      operationState: values.operationState,
      nonOperationalReason:
        values.operationState === "non-operative"
          ? (values.nonOperationalReason as PumpNonOperationalReason)
          : null,
      position: validation.parsedPosition,
      connection: pump.side === "bench" ? "none" : values.connection,
      signals: {
        p: validation.parsedPValue,
        d: validation.parsedDValue,
        s: validation.parsedSValue,
      },
    });

    if (error) {
      setSaveError(error);
    }
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
      <div className="hmi-panel w-full max-w-5xl rounded-[2rem] border-slate-600/70 bg-slate-950/94">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Editor tactil
            </p>
            <h2 className="mt-2 text-3xl text-slate-50">Bomba SAP {pump.sap}</h2>
            <p className="mt-2 max-w-xl text-base text-slate-300/78">
              Edita el estado operativo y la conexion visual sin alterar el drag and
              drop de la unidad.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/80 text-2xl text-slate-200 transition hover:border-[#7FB3C8]/40 hover:text-white"
            aria-label="Cerrar editor"
          >
            x
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <PumpFormFields
            values={values}
            errors={errors}
            showConnection
            showSignals
            onChange={updateField}
          />

          <aside className="space-y-4 rounded-[1.6rem] border border-slate-700/70 bg-slate-900/72 p-5">
            <SummaryRow label="Zona actual" value={SIDE_LABELS[pump.side]} />
            <SummaryRow label="Posicion actual" value={String(pump.position)} />
            <SummaryRow
              label="Linea actual"
              value={CONNECTION_META[pump.side === "bench" ? "none" : values.connection].label}
            />
          </aside>
        </div>

        {saveError ? (
          <div className="px-6 pb-1">
            <div className="rounded-[1.2rem] border border-amber-200/20 bg-[#8B6A4A]/14 px-4 py-3 text-sm text-[#F1E0CE]">
              {saveError}
            </div>
          </div>
        ) : null}

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
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
