export type SetNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type PumpSide = "left" | "right" | "bench";
export type PumpConnection = "clean" | "dirty" | "none";
export type PumpOperationState = "operative" | "non-operative";
export type PumpNonOperationalReason = string;
export type PumpSetMovement = "entering" | "leaving" | "maintenance";
export type ManifoldType = "clean" | "dirty";
export type PumpSignalKey = "p" | "d" | "s";
export type PumpSignalColumnCount = 3 | 5;
export type WellStageMode = "single" | "dual-simul";

export type WellStageEntry = {
  well: string;
  stage: string;
};

export type WellStageContext = {
  mode: WellStageMode;
  pad: string;
  primary: WellStageEntry;
  secondary: WellStageEntry;
};

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
  setMovement: PumpSetMovement | null;
  setMovementEdited: boolean;
  setMovementComment: string;
  position: number;
  isDgb: boolean;
  substitutionPercentage: number;
  substitutionError: string;
  signalColumnCount: PumpSignalColumnCount;
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
export const PUMP_SIGNAL_COLUMN_OPTIONS: PumpSignalColumnCount[] = [3, 5];

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
    accentClass: "text-red-400",
    dotClass: "bg-[#8B6A4A]",
    badgeClass: "border-[#8B6A4A]/35 bg-[#8B6A4A]/12 text-[#F0E2D1]",
  },
};

export const PUMP_SET_MOVEMENT_META: Record<
  PumpSetMovement,
  {
    label: string;
    tabClass: string;
    selectClass: string;
    requiresComment: boolean;
    commentLabel: string;
    commentPlaceholder: string;
  }
> = {
  entering: {
    label: "Entra",
    tabClass: "border-emerald-300/40 bg-emerald-500/85 text-emerald-950 shadow-[0_0_18px_rgba(52,211,153,0.34)]",
    selectClass: "text-emerald-100",
    requiresComment: false,
    commentLabel: "Comentario de entrada",
    commentPlaceholder: "Comentario opcional de entrada",
  },
  leaving: {
    label: "Sale",
    tabClass: "border-red-300/40 bg-red-500/85 text-red-950 shadow-[0_0_18px_rgba(248,113,113,0.34)]",
    selectClass: "text-red-100",
    requiresComment: true,
    commentLabel: "Comentario de salida",
    commentPlaceholder: "Explica por que la bomba sale del set",
  },
  maintenance: {
    label: "MTTO",
    tabClass: "border-sky-300/40 bg-sky-500/85 text-sky-950 shadow-[0_0_18px_rgba(56,189,248,0.34)]",
    selectClass: "text-sky-100",
    requiresComment: true,
    commentLabel: "Comentario de mantenimiento",
    commentPlaceholder: "Describe el motivo o trabajo de mantenimiento",
  },
};

export const PUMP_SET_MOVEMENT_VALUES: PumpSetMovement[] = [
  "entering",
  "leaving",
  "maintenance",
];

export function isPumpSetMovement(value: unknown): value is PumpSetMovement {
  return PUMP_SET_MOVEMENT_VALUES.includes(value as PumpSetMovement);
}

export const NON_OPERATIONAL_REASON_OPTIONS: Array<{
  value: PumpNonOperationalReason;
  label: string;
}> = [
  { value: "cavitacion", label: "Cavitación" },
  { value: "empaque", label: "Empaque" },
  { value: "manguerote", label: "Manguerote" },
  { value: "dpm", label: "DPM" },
  { value: "no-encastra", label: "No encastra" },
];

export function getNonOperationalReasonLabel(reason: PumpNonOperationalReason) {
  return (
    NON_OPERATIONAL_REASON_OPTIONS.find((option) => option.value === reason)?.label ??
    reason
  );
}

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
    label: "Linea celeste",
    shortLabel: "",
    lineClass: "bg-[#7FB3C8]",
    dotClass: "bg-[#7FB3C8]",
    pillClass: "border-[#7FB3C8]/35 bg-[#7FB3C8]/12 text-[#DBE8EE]",
    labelClass: "text-[#B8D0DB]",
  },
  dirty: {
    label: "Linea marron",
    shortLabel: "",
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

export const PUMP_SET_MOVEMENT_OPTIONS = (
  PUMP_SET_MOVEMENT_VALUES
).map((setMovement) => ({
  value: setMovement,
  label: PUMP_SET_MOVEMENT_META[setMovement].label,
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
