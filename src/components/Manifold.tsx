type ManifoldProps = {
  rowCount: number;
};

export function Manifold({ rowCount }: ManifoldProps) {
  const minimumHeight = Math.max(rowCount * 108, 640);

  return (
    <div
      className="hmi-panel relative flex items-center justify-center overflow-hidden rounded-[2rem] border-cyan-400/15 bg-slate-950/70 px-3 py-5"
      style={{ minHeight: `${minimumHeight}px` }}
    >
      <div className="absolute inset-y-10 left-1/2 w-[44px] -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.92)_0%,rgba(30,41,59,0.96)_42%,rgba(15,23,42,0.94)_100%)] shadow-[0_0_32px_rgba(34,211,238,0.12)]" />
      <div className="absolute inset-y-16 left-1/2 w-[8px] -translate-x-1/2 rounded-full bg-cyan-300/25" />
      <div className="absolute left-3 top-4 rounded-full border border-[#9a5f36]/40 bg-[#9a5f36]/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[#eed7c7]">
        Sucio
      </div>
      <div className="absolute right-3 bottom-4 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-100">
        Limpio
      </div>
      <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-slate-100/5" />
      <div className="vertical-label relative z-10 rotate-180 text-sm font-semibold uppercase tracking-[0.58em] text-slate-100/88">
        Manifold
      </div>
    </div>
  );
}
