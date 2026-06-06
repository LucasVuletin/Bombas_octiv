import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  InterstageHistoryRecord,
  InterstagePlan,
  InterstageTask,
  InterstageTaskDepartment,
  Pump,
  SetNumber,
  WellStageContext,
  WellStageEntry,
  WellStageMode,
} from "../models";

type InterstagePlannerProps = {
  history: InterstageHistoryRecord[];
  plan: InterstagePlan;
  pumps: Pump[];
  selectedSet: SetNumber;
  onHistoryAdd: (record: InterstageHistoryRecord) => void;
  onPlanChange: Dispatch<SetStateAction<InterstagePlan>>;
  onPlanReset: () => void;
};

type TaskDraft = {
  area: string;
  pumpSap: string;
  action: string;
  board: string;
  boardPosition: string;
  crew: string;
  detail: string;
  estimatedMinutes: string;
};

const DEPARTMENT_LABELS: Record<InterstageTaskDepartment, string> = {
  pe: "Mantenimiento PE",
  iem: "Mantenimiento IEM",
};

const TASK_ACTIONS: Record<InterstageTaskDepartment, string[]> = {
  pe: ["entra", "sale", "swap", "mtto", "saca 2 / mete 1", "otro"],
  iem: ["cambiar DPM", "revisar comunicacion", "reset tablero", "cambiar sensor", "otro"],
};

const AREA_OPTIONS = [
  "sucio lado ADP",
  "sucio lado arena",
  "limpio lado ADP",
  "limpio lado arena",
  "banco / reserva",
  "tablero",
];

const BASE_OPERATION_MINUTES = 5;

function createEntityId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTaskDraft(department: InterstageTaskDepartment): TaskDraft {
  const action = TASK_ACTIONS[department][0];

  return {
    area: "",
    pumpSap: "",
    action,
    board: "",
    boardPosition: "",
    crew: "",
    detail: "",
    estimatedMinutes: String(getDefaultEstimateMinutes(department, action)),
  };
}

function getDefaultEstimateMinutes(
  department: InterstageTaskDepartment,
  action: string,
) {
  const normalizedAction = action.trim().toLowerCase();

  if (department === "pe") {
    if (normalizedAction === "swap") {
      return 10;
    }

    if (normalizedAction === "saca 2 / mete 1") {
      return 15;
    }

    if (normalizedAction === "entra" || normalizedAction === "sale") {
      return 5;
    }

    return 8;
  }

  if (normalizedAction === "cambiar dpm") {
    return 6;
  }

  if (normalizedAction.includes("reset")) {
    return 4;
  }

  return 7;
}

function parseEstimate(value: string, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return Math.round(parsedValue * 10) / 10;
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function parseDateMs(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = Date.parse(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const roundedValue = Math.round(value * 10) / 10;

  return Number.isInteger(roundedValue) ? String(roundedValue) : roundedValue.toFixed(1);
}

function buildStageLabel(stageContext: WellStageContext) {
  const entries = [
    stageContext.primary,
    ...(stageContext.mode === "dual-simul" ? [stageContext.secondary] : []),
  ]
    .map((entry) => {
      const well = entry.well.trim();
      const stage = entry.stage.trim();

      if (well && stage) {
        return `${well} etapa ${stage}`;
      }

      return well || (stage ? `etapa ${stage}` : "");
    })
    .filter(Boolean);

  const pad = stageContext.pad.trim();
  const stageLabel = entries.length > 0 ? entries.join(" / ") : "sin pozo-etapa";

  return pad ? `${pad} - ${stageLabel}` : stageLabel;
}

function buildTaskSignature(tasks: InterstageTask[]) {
  if (tasks.length === 0) {
    return "sin-tareas";
  }

  const actionCounts = new Map<string, number>();

  tasks.forEach((task) => {
    const key = `${task.department}:${task.action.trim().toLowerCase() || "sin-accion"}`;
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  });

  return Array.from(actionCounts.entries())
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, count]) => `${key}x${count}`)
    .join("|");
}

function buildTaskText(task: InterstageTask) {
  const pumpLabel = task.pumpSap.trim() || "Bomba s/d";
  const actionLabel = task.action.trim() || "tarea";
  const boardParts = [
    task.board.trim() ? `tablero ${task.board.trim()}` : "",
    task.boardPosition.trim() ? `posicion ${task.boardPosition.trim()}` : "",
  ].filter(Boolean);
  const boardText = boardParts.length > 0 ? ` (${boardParts.join(", ")})` : "";
  const lines = [`${pumpLabel}: ${actionLabel}${boardText}`];

  if (task.crew.trim()) {
    lines.push(task.crew.trim());
  }

  if (task.detail.trim()) {
    lines.push(task.detail.trim());
  }

  return lines.join("\n");
}

function buildMessage(plan: InterstagePlan) {
  const header = `Chicos, faltan ${plan.stageLeadMinutes} minutos para que finalice la etapa. Paso movimientos:`;
  const nextStageLabel = buildStageLabel(plan.nextStageContext);
  const peTasks = plan.tasks.filter((task) => task.department === "pe");
  const iemTasks = plan.tasks.filter((task) => task.department === "iem");
  const sections: string[] = [];

  if (nextStageLabel !== "sin pozo-etapa") {
    sections.push(`proxima etapa:\n${nextStageLabel}`);
  }

  if (peTasks.length > 0) {
    const groupedByArea = new Map<string, InterstageTask[]>();

    peTasks.forEach((task) => {
      const area = task.area.trim() || "sin zona definida";
      groupedByArea.set(area, [...(groupedByArea.get(area) ?? []), task]);
    });

    groupedByArea.forEach((tasks, area) => {
      sections.push(`${area}:\n${tasks.map(buildTaskText).join("\n\n")}`);
    });
  }

  if (iemTasks.length > 0) {
    sections.push(`mantenimiento IEM:\n${iemTasks.map(buildTaskText).join("\n\n")}`);
  }

  if (sections.length === 0) {
    sections.push("Sin movimientos cargados.");
  }

  if (plan.note.trim()) {
    sections.push(`nota:\n${plan.note.trim()}`);
  }

  return `${header}\n\n${sections.join("\n\n")}`;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
      {children}
    </span>
  );
}

type NextStageField = keyof WellStageEntry;

function ContextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
      />
    </label>
  );
}

function NextStageContextFields({
  context,
  onChange,
}: {
  context: WellStageContext;
  onChange: (context: WellStageContext) => void;
}) {
  function updatePad(value: string) {
    onChange({
      ...context,
      pad: value,
    });
  }

  function updateEntry(entry: "primary" | "secondary", field: NextStageField, value: string) {
    onChange({
      ...context,
      [entry]: {
        ...context[entry],
        [field]: value,
      },
    });
  }

  function updateMode(mode: WellStageMode) {
    onChange({
      ...context,
      mode,
    });
  }

  return (
    <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Proxima etapa
          </p>
          <h3 className="mt-1 text-xl text-slate-50">Pozo y etapa planificada</h3>
        </div>

        <label className="block min-w-[12rem]">
          <FieldLabel>Modalidad</FieldLabel>
          <select
            value={context.mode}
            onChange={(event) => updateMode(event.target.value as WellStageMode)}
            className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
          >
            <option value="single">Zipper</option>
            <option value="dual-simul">Dual / Simul</option>
          </select>
        </label>
      </div>

      <div className={`grid gap-3 ${context.mode === "dual-simul" ? "md:grid-cols-5" : "md:grid-cols-3"}`}>
        <ContextInput
          label="Pad"
          value={context.pad}
          onChange={updatePad}
          placeholder="Pad"
        />
        <ContextInput
          label="Pozo 1"
          value={context.primary.well}
          onChange={(value) => updateEntry("primary", "well", value)}
          placeholder="Pozo"
        />
        <ContextInput
          label="Etapa 1"
          value={context.primary.stage}
          onChange={(value) => updateEntry("primary", "stage", value)}
          placeholder="Etapa"
        />

        {context.mode === "dual-simul" ? (
          <>
            <ContextInput
              label="Pozo 2"
              value={context.secondary.well}
              onChange={(value) => updateEntry("secondary", "well", value)}
              placeholder="Pozo"
            />
            <ContextInput
              label="Etapa 2"
              value={context.secondary.stage}
              onChange={(value) => updateEntry("secondary", "stage", value)}
              placeholder="Etapa"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function InterstagePlanner({
  history,
  plan,
  pumps,
  selectedSet,
  onHistoryAdd,
  onPlanChange,
  onPlanReset,
}: InterstagePlannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDepartment, setActiveDepartment] =
    useState<InterstageTaskDepartment>("pe");
  const [draft, setDraft] = useState<TaskDraft>(() => createTaskDraft("pe"));
  const [nowMs, setNowMs] = useState(Date.now());
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    setDraft(createTaskDraft(activeDepartment));
  }, [activeDepartment]);

  useEffect(() => {
    if (plan.status !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [plan.status]);

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  const sortedPumps = useMemo(
    () =>
      [...pumps].sort((firstPump, secondPump) =>
        firstPump.sap.localeCompare(secondPump.sap),
      ),
    [pumps],
  );
  const activeActions = TASK_ACTIONS[activeDepartment];
  const message = useMemo(() => buildMessage(plan), [plan]);
  const signature = useMemo(() => buildTaskSignature(plan.tasks), [plan.tasks]);
  const stageLabel = useMemo(
    () => buildStageLabel(plan.nextStageContext),
    [plan.nextStageContext],
  );
  const taskCounts = useMemo(() => {
    return plan.tasks.reduce(
      (counts, task) => ({
        ...counts,
        [task.department]: counts[task.department] + 1,
      }),
      { pe: 0, iem: 0 } as Record<InterstageTaskDepartment, number>,
    );
  }, [plan.tasks]);
  const criticalTaskMinutes = useMemo(
    () =>
      plan.tasks.reduce(
        (highestEstimate, task) => Math.max(highestEstimate, task.estimatedMinutes),
        0,
      ),
    [plan.tasks],
  );
  const heuristicMinutes =
    BASE_OPERATION_MINUTES + criticalTaskMinutes;
  const similarHistory = useMemo(
    () =>
      history.filter(
        (record) =>
          record.setNumber === selectedSet &&
          record.signature === signature &&
          record.id !== plan.historyRecordId,
      ),
    [history, plan.historyRecordId, selectedSet, signature],
  );
  const setHistory = useMemo(
    () =>
      history.filter(
        (record) => record.setNumber === selectedSet && record.id !== plan.historyRecordId,
      ),
    [history, plan.historyRecordId, selectedSet],
  );
  const similarAverageSeconds =
    similarHistory.length > 0
      ? similarHistory.reduce((total, record) => total + record.durationSeconds, 0) /
        similarHistory.length
      : null;
  const setAverageSeconds =
    setHistory.length > 0
      ? setHistory.reduce((total, record) => total + record.durationSeconds, 0) /
        setHistory.length
      : null;
  const projectedMinutes =
    similarAverageSeconds !== null ? similarAverageSeconds / 60 : heuristicMinutes;
  const projectedDelta = projectedMinutes - plan.targetMinutes;
  const startedMs = parseDateMs(plan.startedAt);
  const endedMs = parseDateMs(plan.endedAt);
  const elapsedSeconds =
    plan.status === "running" && startedMs !== null
      ? (nowMs - startedMs) / 1000
      : plan.status === "completed" && startedMs !== null && endedMs !== null
        ? (endedMs - startedMs) / 1000
        : 0;
  const targetSeconds = plan.targetMinutes * 60;
  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);
  const overtimeSeconds = Math.max(elapsedSeconds - targetSeconds, 0);
  const completedTaskCount = plan.tasks.filter((task) => task.completed).length;
  const plannerBodyId = "interstage-planner-body";

  function updatePlan(updater: (currentPlan: InterstagePlan) => InterstagePlan) {
    const updatedAt = new Date().toISOString();

    onPlanChange((currentPlan) => ({
      ...updater(currentPlan),
      updatedAt,
    }));
  }

  function updateDraft<Key extends keyof TaskDraft>(field: Key, value: TaskDraft[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function handleActionChange(action: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      action,
      estimatedMinutes: String(getDefaultEstimateMinutes(activeDepartment, action)),
    }));
  }

  function handleAddTask() {
    const fallbackEstimate = getDefaultEstimateMinutes(activeDepartment, draft.action);
    const task: InterstageTask = {
      id: createEntityId("interstage-task"),
      department: activeDepartment,
      area: draft.area.trim(),
      pumpSap: draft.pumpSap.trim(),
      action: draft.action.trim() || TASK_ACTIONS[activeDepartment][0],
      board: draft.board.trim(),
      boardPosition: draft.boardPosition.trim(),
      crew: draft.crew.trim(),
      detail: draft.detail.trim(),
      estimatedMinutes: parseEstimate(draft.estimatedMinutes, fallbackEstimate),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    updatePlan((currentPlan) => ({
      ...currentPlan,
      tasks: [...currentPlan.tasks, task],
      historyRecordId: currentPlan.status === "completed" ? null : currentPlan.historyRecordId,
      status: currentPlan.status === "completed" ? "planning" : currentPlan.status,
      endedAt: currentPlan.status === "completed" ? null : currentPlan.endedAt,
    }));

    setDraft((currentDraft) => ({
      ...createTaskDraft(activeDepartment),
      area: currentDraft.area,
      crew: currentDraft.crew,
    }));
  }

  function handleTaskCompletedChange(taskId: string, completed: boolean) {
    updatePlan((currentPlan) => ({
      ...currentPlan,
      tasks: currentPlan.tasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task,
      ),
    }));
  }

  function handleRemoveTask(taskId: string) {
    updatePlan((currentPlan) => ({
      ...currentPlan,
      tasks: currentPlan.tasks.filter((task) => task.id !== taskId),
    }));
  }

  function handleNextStageContextChange(context: WellStageContext) {
    updatePlan((currentPlan) => ({
      ...currentPlan,
      nextStageContext: context,
    }));
  }

  function handleStartTimer() {
    const startedAt = new Date().toISOString();

    updatePlan((currentPlan) => ({
      ...currentPlan,
      status: "running",
      startedAt: currentPlan.startedAt ?? startedAt,
      endedAt: null,
      historyRecordId: null,
    }));
    setNowMs(Date.now());
  }

  function handleCompleteTimer() {
    const endedAt = new Date().toISOString();
    const startedAt = plan.startedAt ?? endedAt;
    const startedTime = Date.parse(startedAt);
    const endedTime = Date.parse(endedAt);
    const durationSeconds =
      Number.isFinite(startedTime) && Number.isFinite(endedTime)
        ? Math.max(0, (endedTime - startedTime) / 1000)
        : 0;
    const record: InterstageHistoryRecord = {
      id: createEntityId("interstage-history"),
      setNumber: selectedSet,
      stageLabel,
      signature,
      taskCount: plan.tasks.length,
      peTaskCount: plan.tasks.filter((task) => task.department === "pe").length,
      iemTaskCount: plan.tasks.filter((task) => task.department === "iem").length,
      targetMinutes: plan.targetMinutes,
      startedAt,
      endedAt,
      durationSeconds,
      tasks: plan.tasks,
    };

    if (!plan.historyRecordId) {
      onHistoryAdd(record);
    }

    onPlanChange({
      ...plan,
      status: "completed",
      startedAt,
      endedAt,
      historyRecordId: plan.historyRecordId ?? record.id,
      updatedAt: endedAt,
    });
  }

  function handleResetPlan() {
    if (!window.confirm("Limpiar la planificacion de la proxima entre etapa?")) {
      return;
    }

    onPlanReset();
  }

  async function handleCopyMessage() {
    try {
      if ("clipboard" in navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = message;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopyState("copied");
    } catch (error) {
      console.warn("No se pudo copiar el mensaje:", error);
      setCopyState("failed");
    }
  }

  function renderTaskList(department: InterstageTaskDepartment) {
    const departmentTasks = plan.tasks.filter((task) => task.department === department);

    if (departmentTasks.length === 0) {
      return (
        <div className="rounded-[1.35rem] border border-dashed border-slate-700/80 bg-slate-950/30 px-4 py-5 text-sm text-slate-400">
          Sin tareas cargadas.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {departmentTasks.map((task) => (
          <article
            key={task.id}
            className="rounded-[1.35rem] border border-slate-700/70 bg-slate-950/46 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <label className="flex min-w-0 flex-1 items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(event) =>
                    handleTaskCompletedChange(task.id, event.target.checked)
                  }
                  className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-950 text-[#7FB3C8] focus:ring-[#7FB3C8]/30"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg font-black tracking-[0.12em] text-slate-50">
                      {task.pumpSap || "S/D"}
                    </span>
                    <span className="rounded-full border border-[#7FB3C8]/25 bg-[#7FB3C8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#DBE8EE]">
                      {task.action}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {formatMinutes(task.estimatedMinutes)} min
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-300">
                    {task.area || "sin zona definida"}
                    {task.board || task.boardPosition
                      ? ` | tablero ${task.board || "-"} posicion ${
                          task.boardPosition || "-"
                        }`
                      : ""}
                  </span>
                  {task.crew ? (
                    <span className="mt-1 block text-sm font-semibold text-slate-200">
                      {task.crew}
                    </span>
                  ) : null}
                  {task.detail ? (
                    <span className="mt-1 block text-sm leading-6 text-slate-400">
                      {task.detail}
                    </span>
                  ) : null}
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleRemoveTask(task.id)}
                className="min-h-11 rounded-xl border border-rose-300/20 bg-rose-500/8 px-4 text-sm font-semibold text-rose-100 transition hover:border-rose-300/38 hover:bg-rose-500/12"
              >
                Quitar
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="hmi-panel rounded-[2rem] p-4 md:p-6">
      <datalist id="interstage-area-options">
        {AREA_OPTIONS.map((area) => (
          <option key={area} value={area} />
        ))}
      </datalist>
      <datalist id="interstage-pump-options">
        {sortedPumps.map((pump) => (
          <option key={pump.id} value={pump.sap}>
            {pump.side === "bench" ? "Fuera del set" : `Posicion ${pump.position}`}
          </option>
        ))}
      </datalist>

      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <button
          type="button"
          aria-controls={plannerBodyId}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          className="flex min-h-20 flex-1 flex-col items-start justify-center rounded-[1.35rem] border border-slate-700/70 bg-slate-950/45 px-5 py-4 text-left transition hover:border-[#7FB3C8]/45 hover:bg-[#7FB3C8]/8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Proxima entre etapa
          </p>
          <span className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-slate-50">
              Plan operativo y mantenimiento
            </span>
            <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              {isExpanded ? "Cerrar" : "Abrir"}
            </span>
          </span>
          <span className="mt-2 text-sm leading-6 text-slate-300/78">
            {stageLabel} | SET {selectedSet}
          </span>
        </button>

        <div className="grid gap-3 sm:grid-cols-4 2xl:min-w-[44rem]">
          <div className="rounded-[1.35rem] border border-slate-700/70 bg-slate-950/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Estado
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {plan.status === "planning"
                ? "Planeando"
                : plan.status === "running"
                  ? "En curso"
                  : "Cerrada"}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-700/70 bg-slate-950/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Tareas
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {completedTaskCount}/{plan.tasks.length}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-700/70 bg-slate-950/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Estimado
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-50">
              {formatMinutes(projectedMinutes)} min
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-700/70 bg-slate-950/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Reloj
            </p>
            <p className="mt-2 font-mono text-lg font-black tracking-[0.08em] text-slate-50">
              {formatClock(elapsedSeconds)}
            </p>
          </div>
        </div>
      </div>

      {isExpanded ? (
      <div id={plannerBodyId} className="mt-5 border-t border-slate-800/80 pt-5">
      <div className="grid gap-5 2xl:grid-cols-[26rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <label className="block">
                <FieldLabel>Faltan min</FieldLabel>
                <input
                  type="number"
                  min={0}
                  value={plan.stageLeadMinutes}
                  onChange={(event) =>
                    updatePlan((currentPlan) => ({
                      ...currentPlan,
                      stageLeadMinutes: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-lg font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>
              <label className="block">
                <FieldLabel>Objetivo min</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={plan.targetMinutes}
                  onChange={(event) =>
                    updatePlan((currentPlan) => ({
                      ...currentPlan,
                      targetMinutes: Math.max(1, Number(event.target.value) || 15),
                    }))
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-lg font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-slate-700/70 bg-slate-950/70 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Cronometro entre etapa
              </p>
              <p className="mt-3 font-mono text-5xl font-black tracking-[0.08em] text-slate-50">
                {formatClock(elapsedSeconds)}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                {overtimeSeconds > 0
                  ? `+${formatClock(overtimeSeconds)} sobre objetivo`
                  : `${formatClock(remainingSeconds)} restantes`}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={handleStartTimer}
                className="min-h-14 rounded-2xl border border-emerald-300/24 bg-emerald-500/10 px-5 text-base font-semibold text-emerald-100 transition hover:border-emerald-300/42 hover:bg-emerald-500/14"
              >
                Caudal 0: iniciar
              </button>
              <button
                type="button"
                onClick={handleCompleteTimer}
                className="min-h-14 rounded-2xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-5 text-base font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
              >
                Caudal 15 BPM: cerrar
              </button>
              <button
                type="button"
                onClick={handleResetPlan}
                className="min-h-12 rounded-xl border border-slate-700/70 bg-slate-950/70 px-4 text-sm font-semibold text-slate-300 transition hover:border-slate-500/80 hover:text-white"
              >
                Limpiar plan
              </button>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Estimacion
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-50">
              {formatMinutes(projectedMinutes)} min
            </p>
            <p
              className={`mt-2 text-sm font-semibold ${
                projectedDelta > 0 ? "text-amber-100" : "text-emerald-100"
              }`}
            >
              {projectedDelta > 0
                ? `+${formatMinutes(projectedDelta)} min vs objetivo`
                : `${formatMinutes(Math.abs(projectedDelta))} min de margen`}
            </p>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
              <p>
                Base operativo {BASE_OPERATION_MINUTES} min | Tarea critica{" "}
                {formatMinutes(criticalTaskMinutes)} min
              </p>
              <p>
                Criterio no acumulativo: PE {taskCounts.pe} | IEM {taskCounts.iem}
              </p>
              <p>
                Historico similar:{" "}
                {similarAverageSeconds !== null
                  ? `${formatMinutes(similarAverageSeconds / 60)} min (${similarHistory.length})`
                  : "sin registros"}
              </p>
              <p>
                Historico SET {selectedSet}:{" "}
                {setAverageSeconds !== null
                  ? `${formatMinutes(setAverageSeconds / 60)} min (${setHistory.length})`
                  : "sin registros"}
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <NextStageContextFields
            context={plan.nextStageContext}
            onChange={handleNextStageContextChange}
          />

          <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Carga manual
                </p>
                <h3 className="mt-1 text-xl text-slate-50">
                  {DEPARTMENT_LABELS[activeDepartment]}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-700/70 bg-slate-950/72 p-1">
                {(["pe", "iem"] as InterstageTaskDepartment[]).map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => setActiveDepartment(department)}
                    className={`min-h-12 rounded-xl px-4 text-sm font-semibold transition ${
                      activeDepartment === department
                        ? "bg-[#7FB3C8]/18 text-slate-50 ring-1 ring-[#7FB3C8]/35"
                        : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    {department.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <label className="block lg:col-span-2">
                <FieldLabel>Zona</FieldLabel>
                <input
                  list="interstage-area-options"
                  value={draft.area}
                  onChange={(event) => updateDraft("area", event.target.value)}
                  placeholder="sucio lado ADP"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block">
                <FieldLabel>Bomba SAP</FieldLabel>
                <input
                  list="interstage-pump-options"
                  inputMode="numeric"
                  value={draft.pumpSap}
                  onChange={(event) =>
                    updateDraft(
                      "pumpSap",
                      event.target.value.replace(/[^\d]/g, "").slice(0, 4),
                    )
                  }
                  placeholder="8199"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 font-mono text-lg font-black tracking-[0.12em] text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block">
                <FieldLabel>Accion</FieldLabel>
                <select
                  value={draft.action}
                  onChange={(event) => handleActionChange(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                >
                  {activeActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <FieldLabel>Tablero</FieldLabel>
                <input
                  inputMode="numeric"
                  value={draft.board}
                  onChange={(event) =>
                    updateDraft(
                      "board",
                      event.target.value.replace(/[^\d]/g, "").slice(0, 3),
                    )
                  }
                  placeholder="2"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block">
                <FieldLabel>Posicion</FieldLabel>
                <input
                  inputMode="numeric"
                  value={draft.boardPosition}
                  onChange={(event) =>
                    updateDraft(
                      "boardPosition",
                      event.target.value.replace(/[^\d]/g, "").slice(0, 3),
                    )
                  }
                  placeholder="6"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block">
                <FieldLabel>Min</FieldLabel>
                <input
                  inputMode="decimal"
                  value={draft.estimatedMinutes}
                  onChange={(event) =>
                    updateDraft(
                      "estimatedMinutes",
                      event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
                    )
                  }
                  placeholder="10"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <FieldLabel>Personal</FieldLabel>
                <input
                  value={draft.crew}
                  onChange={(event) => updateDraft("crew", event.target.value)}
                  placeholder="Andres - Jesus - Matias - Ailin"
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <label className="block lg:col-span-3">
                <FieldLabel>Detalle</FieldLabel>
                <input
                  value={draft.detail}
                  onChange={(event) => updateDraft("detail", event.target.value)}
                  placeholder={
                    activeDepartment === "iem"
                      ? "Se apago en etapa anterior, cambiar DPM"
                      : "Comentario operativo"
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="min-h-12 w-full rounded-xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-5 text-base font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-5 2xl:grid-cols-2">
            <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl text-slate-50">Mantenimiento PE</h3>
                <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {plan.tasks.filter((task) => task.department === "pe").length}
                </span>
              </div>
              {renderTaskList("pe")}
            </div>

            <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xl text-slate-50">Mantenimiento IEM</h3>
                <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {plan.tasks.filter((task) => task.department === "iem").length}
                </span>
              </div>
              {renderTaskList("iem")}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-700/70 bg-slate-950/45 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Mensaje operativo
                </p>
                <h3 className="mt-1 text-xl text-slate-50">Preview WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleCopyMessage();
                }}
                className="min-h-12 rounded-xl border border-[#7FB3C8]/35 bg-[#7FB3C8]/12 px-5 text-sm font-semibold text-slate-50 transition hover:border-[#7FB3C8]/55 hover:bg-[#7FB3C8]/16"
              >
                {copyState === "copied"
                  ? "Copiado"
                  : copyState === "failed"
                    ? "No copio"
                    : "Copiar mensaje"}
              </button>
            </div>
            <textarea
              value={message}
              readOnly
              className="min-h-[17rem] w-full resize-y rounded-[1.35rem] border border-slate-700/70 bg-slate-950/70 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none"
            />
            <label className="mt-4 block">
              <FieldLabel>Nota adicional</FieldLabel>
              <input
                value={plan.note}
                onChange={(event) =>
                  updatePlan((currentPlan) => ({
                    ...currentPlan,
                    note: event.target.value,
                  }))
                }
                placeholder="Aviso general para operadores"
                className="min-h-12 w-full rounded-xl border border-slate-700/70 bg-slate-900/85 px-4 text-base font-semibold text-slate-50 outline-none transition focus:border-[#7FB3C8]/60 focus:ring-2 focus:ring-[#7FB3C8]/20"
              />
            </label>
          </div>
        </div>
      </div>
      </div>
      ) : null}
    </section>
  );
}
