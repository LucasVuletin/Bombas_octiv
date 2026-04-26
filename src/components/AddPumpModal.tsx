import { useEffect, useState } from "react";
import { createMockSignals } from "../data/defaultPumps";
import { PumpFormFields } from "./PumpFormFields";
import { PumpNonOperationalReason } from "../models";
import {
  PumpFormErrors,
  PumpFormValues,
  normalizeSapInput,
  validatePumpForm,
} from "../utils/validation";

type AddPumpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddPump: (values: {
    sap: string;
    operationState: "operative" | "non-operative";
    nonOperationalReason: PumpNonOperationalReason | null;
    position: number;
    signals: {
      p: number;
      d: number;
      s: number;
    };
  }) => void;
};

function createInitialValues(): PumpFormValues {
  const signals = createMockSignals();

  return {
    sap: "",
    operationState: "",
    nonOperationalReason: "",
    position: "",
    connection: "none",
    pValue: String(signals.p),
    dValue: String(signals.d),
    sValue: String(signals.s),
  };
}

export function AddPumpModal({ isOpen, onClose, onAddPump }: AddPumpModalProps) {
  const [values, setValues] = useState<PumpFormValues>(createInitialValues);
  const [errors, setErrors] = useState<PumpFormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setValues(createInitialValues());
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
  }

  function handleSubmit() {
    const validation = validatePumpForm(values);

    if (!validation.isValid || values.operationState === "") {
      setErrors(validation.errors);
      return;
    }

    onAddPump({
      sap: values.sap,
      operationState: values.operationState,
      nonOperationalReason:
        values.operationState === "non-operative"
          ? (values.nonOperationalReason as PumpNonOperationalReason)
          : null,
      position: validation.parsedPosition,
      signals: {
        p: validation.parsedPValue,
        d: validation.parsedDValue,
        s: validation.parsedSValue,
      },
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
            <h2 className="mt-2 text-3xl text-slate-50">Agregar bomba</h2>
            <p className="mt-2 max-w-xl text-base text-slate-300/78">
              La bomba nueva entra al banco de disponibles y luego puede moverse con
              drag and drop al set activo.
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

        <div className="px-6 py-6">
          <PumpFormFields values={values} errors={errors} onChange={updateField} />
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
            Agregar bomba
          </button>
        </div>
      </div>
    </div>
  );
}
