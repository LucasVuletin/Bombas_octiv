import {
  MAX_PUMP_POSITION,
  MAX_SIGNAL_VALUE,
  MIN_SIGNAL_VALUE,
  ManifoldType,
  PumpConnection,
  PumpNonOperationalReason,
  PumpOperationState,
  PumpSignalColumnCount,
} from "../models";

export type PumpFormValues = {
  sap: string;
  operationState: PumpOperationState | "";
  nonOperationalReason: PumpNonOperationalReason;
  isDgb: boolean;
  substitutionPercentage: string;
  substitutionError: string;
  signalColumnCount: PumpSignalColumnCount;
  connection: PumpConnection;
  pValue: string;
  dValue: string;
  sValue: string;
};

export type PumpFormErrors = Partial<
  Record<
    | "sap"
    | "operationState"
    | "nonOperationalReason"
    | "substitutionPercentage"
    | "pValue"
    | "dValue"
    | "sValue",
    string
  >
>;

export type ManifoldFormValues = {
  type: ManifoldType | "";
  pumpsPerSide: string;
};

export type ManifoldFormErrors = Partial<Record<"type" | "pumpsPerSide", string>>;

export function normalizeSapInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function validatePumpForm(values: PumpFormValues) {
  const errors: PumpFormErrors = {};

  if (!/^\d{4}$/.test(values.sap)) {
    errors.sap = "El SAP debe tener exactamente 4 digitos.";
  }

  if (!values.operationState) {
    errors.operationState = "Selecciona el estado operativo.";
  }

  if (values.operationState === "non-operative" && !values.nonOperationalReason.trim()) {
    errors.nonOperationalReason = "Ingresa un motivo.";
  }

  const parsedSubstitutionPercentage = Number(values.substitutionPercentage);

  if (
    values.isDgb &&
    (values.substitutionPercentage.trim() === "" ||
      !Number.isInteger(parsedSubstitutionPercentage) ||
      parsedSubstitutionPercentage < 0 ||
      parsedSubstitutionPercentage > 100)
  ) {
    errors.substitutionPercentage = "El porcentaje DGB debe ser un entero entre 0 y 100.";
  }

  const parsedPValue = Number(values.pValue);
  const parsedDValue = Number(values.dValue);
  const parsedSValue = Number(values.sValue);

  if (
    values.pValue.trim() === "" ||
    !Number.isInteger(parsedPValue) ||
    parsedPValue < MIN_SIGNAL_VALUE ||
    parsedPValue > MAX_SIGNAL_VALUE
  ) {
    errors.pValue = `P debe ser un entero entre ${MIN_SIGNAL_VALUE} y ${MAX_SIGNAL_VALUE}.`;
  }

  if (
    values.dValue.trim() === "" ||
    !Number.isInteger(parsedDValue) ||
    parsedDValue < MIN_SIGNAL_VALUE ||
    parsedDValue > MAX_SIGNAL_VALUE
  ) {
    errors.dValue = `D debe ser un entero entre ${MIN_SIGNAL_VALUE} y ${MAX_SIGNAL_VALUE}.`;
  }

  if (
    values.sValue.trim() === "" ||
    !Number.isInteger(parsedSValue) ||
    parsedSValue < MIN_SIGNAL_VALUE ||
    parsedSValue > MAX_SIGNAL_VALUE
  ) {
    errors.sValue = `S debe ser un entero entre ${MIN_SIGNAL_VALUE} y ${MAX_SIGNAL_VALUE}.`;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    parsedSubstitutionPercentage: values.isDgb ? parsedSubstitutionPercentage : 0,
    parsedPValue,
    parsedDValue,
    parsedSValue,
  };
}

export function validateManifoldForm(values: ManifoldFormValues) {
  const errors: ManifoldFormErrors = {};
  const parsedPumpsPerSide = Number(values.pumpsPerSide);

  if (!values.type) {
    errors.type = "Selecciona el tipo de manifold.";
  }

  if (
    values.pumpsPerSide.trim() === "" ||
    !Number.isInteger(parsedPumpsPerSide) ||
    parsedPumpsPerSide < 1 ||
    parsedPumpsPerSide > MAX_PUMP_POSITION
  ) {
    errors.pumpsPerSide = `La cantidad debe ser un entero entre 1 y ${MAX_PUMP_POSITION}.`;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    parsedPumpsPerSide,
  };
}
