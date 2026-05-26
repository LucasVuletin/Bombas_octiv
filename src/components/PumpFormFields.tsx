import {
  CONNECTION_OPTIONS,
  MAX_SIGNAL_VALUE,
  MIN_SIGNAL_VALUE,
  NON_OPERATIONAL_REASON_OPTIONS,
  PUMP_OPERATION_OPTIONS,
} from "../models";
import { PumpFormErrors, PumpFormValues } from "../utils/validation";

type PumpFormFieldsProps = {
  values: PumpFormValues;
  errors: PumpFormErrors;
  showConnection?: boolean;
  showSignals?: boolean;
  onChange: <Key extends keyof PumpFormValues>(
    field: Key,
    value: PumpFormValues[Key],
  ) => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{message}</p>;
}

export function PumpFormFields({
  values,
  errors,
  showConnection = false,
  showSignals = false,
  onChange,
}: PumpFormFieldsProps) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
          SAP de la bomba
        </span>
        <input
          inputMode="numeric"
          maxLength={4}
          value={values.sap}
          onChange={(event) => onChange("sap", event.target.value)}
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-3xl tracking-[0.28em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
          placeholder="0335"
        />
        <FieldError message={errors.sap} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
          Estado operativo
        </span>
        <select
          value={values.operationState}
          onChange={(event) =>
            onChange("operationState", event.target.value as PumpFormValues["operationState"])
          }
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
        >
          <option value="">Seleccionar</option>
          {PUMP_OPERATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.operationState} />
      </label>

      {values.operationState === "non-operative" ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
            Motivo de no operativa
          </span>
          <input
            list="non-operational-reason-options"
            value={values.nonOperationalReason}
            onChange={(event) =>
              onChange("nonOperationalReason", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            placeholder="Escribe un motivo o selecciona uno sugerido"
          />
          <datalist id="non-operational-reason-options">
            {NON_OPERATIONAL_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </datalist>
          <FieldError message={errors.nonOperationalReason} />
        </label>
      ) : null}

      <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
          Posicion y DGB
        </p>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Posicion
            </span>
            <input
              inputMode="numeric"
              value={values.position}
              onChange={(event) => onChange("position", event.target.value)}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-2xl tracking-[0.08em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
              placeholder="1 a 40"
            />
            <FieldError message={errors.position} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              DGB
            </span>
            <select
              value={values.isDgb ? "yes" : "no"}
              onChange={(event) => onChange("isDgb", event.target.value === "yes")}
              className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-4 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
            >
              <option value="no">No</option>
              <option value="yes">Si</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Sustitucion
            </span>
            <div className="flex overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/85 transition focus-within:border-[#7FB3C8]/60 focus-within:ring-2 focus-within:ring-[#7FB3C8]/20">
              <input
                inputMode="numeric"
                value={values.substitutionPercentage}
                disabled={!values.isDgb}
                onChange={(event) =>
                  onChange(
                    "substitutionPercentage",
                    event.target.value.replace(/[^\d]/g, "").slice(0, 3),
                  )
                }
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl tracking-[0.08em] text-slate-50 outline-none disabled:text-slate-500"
                placeholder="0 a 100"
              />
              <span className="flex items-center border-l border-slate-700/70 px-4 text-xl font-semibold text-slate-300">
                %
              </span>
            </div>
            <FieldError message={errors.substitutionPercentage} />
          </label>
        </div>
      </div>

      {showConnection ? (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
            Conexion visual
          </span>
          <select
            value={values.connection}
            onChange={(event) =>
              onChange("connection", event.target.value as PumpFormValues["connection"])
            }
            className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-lg text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
          >
            {CONNECTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showSignals ? (
        <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Datos P / D / S
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Cada valor se replica visualmente en toda la fila de la bomba.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                P
              </span>
              <input
                inputMode="numeric"
                value={values.pValue}
                onChange={(event) => onChange("pValue", event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-xl tracking-[0.08em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                placeholder={`${MIN_SIGNAL_VALUE} a ${MAX_SIGNAL_VALUE}`}
              />
              <FieldError message={errors.pValue} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                D
              </span>
              <input
                inputMode="numeric"
                value={values.dValue}
                onChange={(event) => onChange("dValue", event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-xl tracking-[0.08em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                placeholder={`${MIN_SIGNAL_VALUE} a ${MAX_SIGNAL_VALUE}`}
              />
              <FieldError message={errors.dValue} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                S
              </span>
              <input
                inputMode="numeric"
                value={values.sValue}
                onChange={(event) => onChange("sValue", event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/85 px-5 py-4 text-xl tracking-[0.08em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                placeholder={`${MIN_SIGNAL_VALUE} a ${MAX_SIGNAL_VALUE}`}
              />
              <FieldError message={errors.sValue} />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
