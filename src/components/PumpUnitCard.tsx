import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  getNonOperationalReasonLabel,
  PUMP_OPERATION_META,
  PUMP_SET_MOVEMENT_META,
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
  const setMovementMeta =
    PUMP_SET_MOVEMENT_META[pump.setMovement === "leaving" ? "leaving" : "entering"];
  const setMovementTabPosition =
    pump.side === "left"
      ? "left-0 rounded-l-xl rounded-r-md sm:left-[-1.15rem] sm:rounded-l-2xl"
      : "right-0 rounded-l-md rounded-r-xl sm:right-[-1.15rem] sm:rounded-r-2xl";
  const contentPaddingClass =
    pump.side === "left"
      ? "py-2 pl-8 pr-2 sm:p-3.5 xl:p-4"
      : pump.side === "right"
        ? "py-2 pl-2 pr-8 sm:p-3.5 xl:p-4"
        : "p-2 sm:p-3.5 xl:p-4";
  const reasonLabel = pump.nonOperationalReason
    ? getNonOperationalReasonLabel(pump.nonOperationalReason)
    : null;
  const isDgb = pump.isDgb === true;
  const substitutionPercentage = Number.isFinite(pump.substitutionPercentage)
    ? pump.substitutionPercentage
    : 0;
  const signalColumnCount = pump.signalColumnCount === 5 ? 5 : 3;
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
      role={isOverlay ? undefined : "button"}
      tabIndex={isOverlay ? undefined : 0}
      aria-label={isOverlay ? undefined : `Editar bomba ${pump.sap}`}
      onClick={isOverlay ? undefined : () => onSelect(pump.id)}
      onKeyDown={
        isOverlay
          ? undefined
          : (event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onSelect(pump.id);
              }
            }
      }
      className={[
        "pump-shell relative flex h-[10.5rem] w-full items-stretch xl:h-[11.25rem]",
        isSelected ? "ring-2 ring-[#7FB3C8]/55" : "ring-1 ring-white/5",
        isOverlay ? "shadow-[0_28px_90px_rgba(2,6,23,0.6)]" : "",
        draggable && isDragging ? "opacity-30" : "",
      ].join(" ")}
    >
      <div
        aria-label={`Movimiento set: ${setMovementMeta.label}`}
        className={`pointer-events-none absolute bottom-5 top-5 z-30 flex w-6 items-center justify-center border px-0.5 text-[0.55rem] font-black uppercase leading-none tracking-[0.16em] sm:w-7 sm:text-[0.62rem] ${setMovementTabPosition} ${setMovementMeta.tabClass}`}
      >
        <span className="vertical-label rotate-180">{setMovementMeta.label}</span>
      </div>

      <div className={`relative z-10 flex min-w-0 flex-1 text-left ${contentPaddingClass}`}>
        <div className="flex h-full min-w-0 w-full flex-col">
          <div className="shrink-0 border-b border-white/8 pb-2">
            <div className="grid h-[4rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-0.5 overflow-hidden font-semibold leading-tight sm:h-[3.5rem] sm:gap-x-2 xl:h-[3.25rem]">
              <p className={`self-center whitespace-nowrap text-[10px] leading-none sm:text-[13px] xl:text-sm ${operationMeta.accentClass}`}>
                {operationMeta.cardLabel}
              </p>
              <p className="truncate self-center text-center font-mono text-lg font-bold leading-none tracking-[0.1em] text-slate-50 sm:text-[1.35rem] xl:text-[1.55rem] xl:tracking-[0.14em]">
                {pump.sap}
              </p>
              <p className="truncate self-center whitespace-nowrap text-right text-[10px] leading-none text-[#B8D0DB] sm:text-[13px] xl:text-sm">
                DGB: {isDgb ? `${substitutionPercentage}%` : "No"}
              </p>
              {reasonLabel ? (
                <p className="col-start-1 mt-1 line-clamp-2 break-words text-[10px] leading-[1.05] text-slate-200/90 sm:text-xs xl:text-sm" title={reasonLabel}>
                  {reasonLabel}
                </p>
              ) : null}
              {isDgb && pump.substitutionError.trim() ? (
                <p
                  className="col-start-3 mt-1 line-clamp-2 break-words text-right text-[10px] leading-[1.05] text-amber-100 sm:text-xs xl:text-sm"
                  title={`Error: ${pump.substitutionError}`}
                >
                  Error: {pump.substitutionError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-start gap-2 pt-2">
            <PumpSignalGrid
              signals={pump.signals}
              columnCount={signalColumnCount}
              compact
              className="min-w-0 flex-1 pb-0.5"
            />

            {draggable ? (
              <button
                type="button"
                aria-label={`Arrastrar bomba ${pump.sap}`}
                className="z-20 mt-[1.35rem] flex h-8 w-8 shrink-0 touch-none items-center justify-center rounded-xl border border-slate-600/70 bg-slate-950/80 text-slate-200 transition hover:border-slate-400/70 hover:text-white sm:mt-5 xl:mt-14"
                {...listeners}
                {...attributes}
                onClick={(event) => event.stopPropagation()}
              >
                <DragHandleIcon />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
