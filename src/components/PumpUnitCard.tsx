import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  NON_OPERATIONAL_REASON_META,
  PUMP_OPERATION_META,
  Pump,
} from "../models";
import { PumpSignalGrid } from "./PumpSignalGrid";

type PumpUnitCardProps = {
  pump: Pump;
  onSelect: (pumpId: string) => void;
  isSelected?: boolean;
  draggable?: boolean;
  isOverlay?: boolean;
};

function DragHandleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 6h.01" />
      <path d="M8 12h.01" />
      <path d="M8 18h.01" />
      <path d="M16 6h.01" />
      <path d="M16 12h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

export function PumpUnitCard({
  pump,
  onSelect,
  isSelected = false,
  draggable = true,
  isOverlay = false,
}: PumpUnitCardProps) {
  const operationMeta = PUMP_OPERATION_META[pump.operationState];
  const reasonLabel = pump.nonOperationalReason
    ? NON_OPERATIONAL_REASON_META[pump.nonOperationalReason].label
    : null;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pump.id,
    disabled: !draggable,
    data: {
      type: "pump",
      pumpId: pump.id,
    },
  });

  const transformStyle =
    draggable && transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <article
      ref={draggable ? setNodeRef : undefined}
      style={transformStyle}
      className={[
        "pump-shell relative flex h-[9.25rem] w-full items-stretch",
        isSelected ? "ring-2 ring-[#7FB3C8]/55" : "ring-1 ring-white/5",
        isOverlay ? "shadow-[0_28px_90px_rgba(2,6,23,0.6)]" : "",
        draggable && isDragging ? "opacity-30" : "",
      ].join(" ")}
    >
      <span className="pump-wheel left-12" />
      <span className="pump-wheel left-[7.65rem]" />

      <button
        type="button"
        onClick={() => onSelect(pump.id)}
        className="relative z-10 flex min-w-0 flex-1 px-5 py-2.5 text-left"
      >
        <div className="flex h-full min-w-0 w-full flex-col rounded-[1.35rem] border border-white/10 bg-slate-950/44 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[2px]">
          <div className="grid grid-cols-[minmax(0,5.6rem)_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-white/8 pb-1.5">
            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                SAP
              </p>
              <p className="truncate font-mono text-[1.35rem] font-bold leading-none tracking-[0.14em] text-slate-50">
                {pump.sap}
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-1.5 leading-tight">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 ${operationMeta.dotClass}`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-950/45" />
              </span>
              <span className={`shrink-0 text-[11px] font-semibold ${operationMeta.accentClass}`}>
                {operationMeta.cardLabel}
              </span>
              {reasonLabel ? (
                <span className="truncate text-[10px] uppercase tracking-[0.1em] text-slate-300/82">
                  Motivo: {reasonLabel}
                </span>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Posicion
              </p>
              <p className="text-sm font-semibold leading-none text-slate-100">
                {pump.position}
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center pt-1.5">
            <PumpSignalGrid signals={pump.signals} compact className="w-full min-w-0" />
          </div>
        </div>
      </button>

      {draggable ? (
        <button
          type="button"
          aria-label={`Arrastrar bomba ${pump.sap}`}
          className="relative z-10 my-3 mr-3 flex w-16 shrink-0 touch-none items-center justify-center rounded-[1.25rem] border border-slate-700/70 bg-slate-950/55 text-slate-200 transition hover:border-[#7FB3C8]/35 hover:text-white"
          {...listeners}
          {...attributes}
        >
          <DragHandleIcon />
        </button>
      ) : null}
    </article>
  );
}
