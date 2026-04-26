export type SetNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type PumpSide = "left" | "right" | "bench";
export type PumpConnection = "clean" | "dirty" | "none";
export type PumpOperationState = "operative" | "non-operative";
export type PumpNonOperationalReason =
  | "empaque"
  | "cavitacion"
  | "dpm"
  | "no-encastra";
export type ManifoldType = "clean" | "dirty";
export type PumpSignalKey = "p" | "d" | "s";

export type PumpSignals = {
  p: number;
  d: number;
  s: number;
};

export type Pump = {
  id: string;
  sap: string;
  side: PumpSide;
  manifoldId: string | null;
  row: number;
  connection: PumpConnection;
  operationState: PumpOperationState;
  nonOperationalReason: PumpNonOperationalReason | null;
  position: number;
  signals: PumpSignals;
};

export type Manifold = {
  id: string;
  label: string;
  type: ManifoldType;
  pumpsPerSide: number;
};

export const SET_OPTIONS: SetNumber[] = [1, 2, 3, 4, 5, 6];
export const MAX_PUMP_POSITION = 40;
export const MAX_SIGNAL_VALUE = 150;
export const MIN_SIGNAL_VALUE = 1;
export const PUMP_SIGNAL_COLUMNS = 3;

export const SIDE_LABELS: Record<PumpSide, string> = {
  left: "Izquierda",
  right: "Derecha",
  bench: "Fuera del set",
};

export const PUMP_SIGNAL_LABELS: Record<PumpSignalKey, string> = {
  p: "P",
  d: "D",
  s: "S",
};

export const PUMP_OPERATION_META: Record<
  PumpOperationState,
  {
    label: string;
    cardLabel: string;
    accentClass: string;
    dotClass: string;
    badgeClass: string;
  }
> = {
  operative: {
    label: "Operativa",
    cardLabel: "Operativa",
    accentClass: "text-emerald-200",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  },
  "non-operative": {
    label: "No operativa",
    cardLabel: "No operativa",
    accentClass: "text-amber-100",
    dotClass: "bg-[#8B6A4A]",
    badgeClass: "border-[#8B6A4A]/35 bg-[#8B6A4A]/12 text-[#F0E2D1]",
  },
};

export const NON_OPERATIONAL_REASON_META: Record<
  PumpNonOperationalReason,
  {
    label: string;
  }
> = {
  empaque: {
    label: "empaque",
  },
  cavitacion: {
    label: "cavitacion",
  },
  dpm: {
    label: "DPM",
  },
  "no-encastra": {
    label: "no encastra",
  },
};

export const CONNECTION_META: Record<
  PumpConnection,
  {
    label: string;
    shortLabel: string;
    lineClass: string;
    dotClass: string;
    pillClass: string;
    labelClass: string;
  }
> = {
  clean: {
    label: "Manifold limpio",
    shortLabel: "Limpio",
    lineClass: "bg-[#7FB3C8]",
    dotClass: "bg-[#7FB3C8]",
    pillClass: "border-[#7FB3C8]/35 bg-[#7FB3C8]/12 text-[#DBE8EE]",
    labelClass: "text-[#B8D0DB]",
  },
  dirty: {
    label: "Manifold sucio",
    shortLabel: "Sucio",
    lineClass: "bg-[#8B6A4A]",
    dotClass: "bg-[#8B6A4A]",
    pillClass: "border-[#8B6A4A]/35 bg-[#8B6A4A]/12 text-[#EFE2D4]",
    labelClass: "text-[#D7C2AD]",
  },
  none: {
    label: "Sin conexion",
    shortLabel: "Desconectada",
    lineClass: "bg-slate-600/30",
    dotClass: "bg-slate-500",
    pillClass: "border-slate-500/40 bg-slate-600/20 text-slate-200",
    labelClass: "text-slate-400",
  },
};

export const MANIFOLD_TYPE_META: Record<
  ManifoldType,
  {
    label: string;
    accentClass: string;
    chipClass: string;
    slotClass: string;
  }
> = {
  clean: {
    label: "Limpio",
    accentClass: "border-[#7FB3C8]/35 bg-[#7FB3C8]/10 text-[#DBE8EE]",
    chipClass: "bg-[#7FB3C8]",
    slotClass: "bg-[#7FB3C8]/70",
  },
  dirty: {
    label: "Sucio",
    accentClass: "border-[#8B6A4A]/40 bg-[#8B6A4A]/12 text-[#F0E2D1]",
    chipClass: "bg-[#8B6A4A]",
    slotClass: "bg-[#8B6A4A]/75",
  },
};

export const PUMP_OPERATION_OPTIONS = (
  Object.keys(PUMP_OPERATION_META) as PumpOperationState[]
).map((operationState) => ({
  value: operationState,
  label: PUMP_OPERATION_META[operationState].label,
}));

export const NON_OPERATIONAL_REASON_OPTIONS = (
  Object.keys(NON_OPERATIONAL_REASON_META) as PumpNonOperationalReason[]
).map((reason) => ({
  value: reason,
  label: NON_OPERATIONAL_REASON_META[reason].label,
}));

export const CONNECTION_OPTIONS = (
  Object.keys(CONNECTION_META) as PumpConnection[]
).map((connection) => ({
  value: connection,
  label: CONNECTION_META[connection].label,
}));

export const MANIFOLD_TYPE_OPTIONS = (
  Object.keys(MANIFOLD_TYPE_META) as ManifoldType[]
).map((type) => ({
  value: type,
  label: MANIFOLD_TYPE_META[type].label,
}));

export const PUMP_SIGNAL_KEYS: PumpSignalKey[] = ["p", "d", "s"];
