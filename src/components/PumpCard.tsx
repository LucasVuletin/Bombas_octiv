import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CONNECTION_META, PUMP_STATUS_META, Pump, SIDE_LABELS } from "../types";

type PumpCardProps = {
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-950"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m10.29 3.86-7.54 13.1A2 2 0 0 0 4.46 20h15.08a2 2 0 0 0 1.72-3.04l-7.54-13.1a2 2 0 0 0-3.43 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function PumpCard({
  pump,
  onSelect,
  isSelected = false,
  draggable = true,
  isOverlay = false,
}: PumpCardProps) {
  const statusMeta = PUMP_STATUS_META[pump.status];
  const connectionMeta = CONNECTION_META[pump.connection];
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
        "pump-shell relative flex h-[6.25rem] w-full items-stretch",
        isSelected ? "ring-2 ring-cyan-300/70" : "ring-1 ring-white/5",
        statusMeta.outlineClass,
        isOverlay ? "shadow-[0_28px_90px_rgba(2,6,23,0.6)]" : "",
        draggable && isDragging ? "opacity-30" : "",
      ].join(" ")}
    >
      <span className="pump-wheel left-12" />
      <span className="pump-wheel left-[7.65rem]" />

      <button
        type="button"
        onClick={() => onSelect(pump.id)}
        className="flex flex-1 items-center gap-4 px-7 py-3 text-left"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 ${statusMeta.dotClass}`}
        >
          {statusMeta.alert ? (
            <AlertIcon />
          ) : (
            <span className="h-3 w-3 rounded-full bg-slate-950/40" />
          )}
        </span>

        <span className="min-w-0">
          <span className="flex items-center gap-3">
            <span className="text-[1.7rem] font-semibold tracking-[0.18em] text-slate-50">
              {pump.unitNumber}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusMeta.pillClass}`}
            >
              {statusMeta.shortLabel}
            </span>
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-300/85">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${connectionMeta.pillClass}`}
            >
              {pump.connection === "none" ? "Sin línea" : connectionMeta.shortLabel}
            </span>
            <span className="rounded-full border border-slate-600/70 bg-slate-800/60 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
              {SIDE_LABELS[pump.side]}
            </span>
            <span className="max-w-[12rem] truncate text-xs text-slate-400">
              {pump.notes.trim() ? `Nota: ${pump.notes}` : "Sin notas"}
            </span>
          </span>
        </span>
      </button>

      {draggable ? (
        <button
          type="button"
          aria-label={`Arrastrar bomba ${pump.unitNumber}`}
          className="my-3 mr-3 flex w-16 shrink-0 touch-none items-center justify-center rounded-[1.25rem] border border-cyan-300/20 bg-slate-950/55 text-slate-200 transition hover:border-cyan-300/40 hover:bg-slate-900/85"
          {...listeners}
          {...attributes}
        >
          <DragHandleIcon />
        </button>
      ) : null}
    </article>
  );
}
