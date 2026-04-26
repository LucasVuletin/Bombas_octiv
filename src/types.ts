export type PumpSide = "left" | "right" | "bench";
export type PumpConnection = "clean" | "dirty" | "none";
export type PumpStatus =
  | "operative"
  | "standby"
  | "stopped"
  | "maintenance"
  | "packing"
  | "offline";

export type Pump = {
  id: string;
  unitNumber: string;
  side: PumpSide;
  row: number;
  connection: PumpConnection;
  status: PumpStatus;
  notes: string;
};

export const SIDE_LABELS: Record<PumpSide, string> = {
  left: "Izquierda",
  right: "Derecha",
  bench: "Fuera del set",
};

export const PUMP_STATUS_META: Record<
  PumpStatus,
  {
    label: string;
    shortLabel: string;
    dotClass: string;
    pillClass: string;
    outlineClass: string;
    alert: boolean;
  }
> = {
  operative: {
    label: "Operativa / Bombeando",
    shortLabel: "Operativa",
    dotClass: "bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.75)]",
    pillClass: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(52,211,153,0.35)]",
    alert: false,
  },
  standby: {
    label: "En espera",
    shortLabel: "Standby",
    dotClass: "bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.72)]",
    pillClass: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(252,211,77,0.3)]",
    alert: false,
  },
  stopped: {
    label: "Detenida",
    shortLabel: "Detenida",
    dotClass: "bg-slate-400 shadow-[0_0_16px_rgba(148,163,184,0.55)]",
    pillClass: "border-slate-400/30 bg-slate-500/10 text-slate-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(148,163,184,0.25)]",
    alert: false,
  },
  maintenance: {
    label: "Mantenimiento",
    shortLabel: "Mantenimiento",
    dotClass: "bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.7)]",
    pillClass: "border-orange-300/30 bg-orange-500/10 text-orange-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(251,146,60,0.28)]",
    alert: true,
  },
  packing: {
    label: "Fuera por empaque",
    shortLabel: "Packing",
    dotClass: "bg-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.78)]",
    pillClass: "border-rose-400/30 bg-rose-500/10 text-rose-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(244,63,94,0.32)]",
    alert: true,
  },
  offline: {
    label: "Sin comunicación / fuera de servicio",
    shortLabel: "Offline",
    dotClass: "bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.7)]",
    pillClass: "border-violet-400/30 bg-violet-500/10 text-violet-100",
    outlineClass: "shadow-[0_0_0_1px_rgba(139,92,246,0.28)]",
    alert: true,
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
    lineClass: "bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.75)]",
    dotClass: "bg-cyan-300",
    pillClass: "border-cyan-300/30 bg-cyan-500/10 text-cyan-100",
    labelClass: "text-cyan-200/90",
  },
  dirty: {
    label: "Manifold sucio",
    shortLabel: "Sucio",
    lineClass: "bg-[#9a5f36] shadow-[0_0_20px_rgba(154,95,54,0.72)]",
    dotClass: "bg-[#b5794c]",
    pillClass: "border-[#9a5f36]/40 bg-[#9a5f36]/15 text-[#f5e4d7]",
    labelClass: "text-[#e7c7b0]",
  },
  none: {
    label: "Sin conexión",
    shortLabel: "Desconectada",
    lineClass: "bg-slate-600/20",
    dotClass: "bg-slate-500",
    pillClass: "border-slate-500/40 bg-slate-600/20 text-slate-200",
    labelClass: "text-slate-400",
  },
};

export const STATUS_OPTIONS = (
  Object.keys(PUMP_STATUS_META) as PumpStatus[]
).map((status) => ({
  value: status,
  label: PUMP_STATUS_META[status].label,
}));

export const CONNECTION_OPTIONS = (
  Object.keys(CONNECTION_META) as PumpConnection[]
).map((connection) => ({
  value: connection,
  label: CONNECTION_META[connection].label,
}));
