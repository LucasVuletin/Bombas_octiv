import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { startTransition, useEffect, useState } from "react";
import { AddManifoldModal } from "./components/AddManifoldModal";
import { AddPumpModal } from "./components/AddPumpModal";
import { APP_AUTHOR_CREDIT, APP_VERSION_LABEL } from "./appIdentity";
import { ControlHeader } from "./components/ControlHeader";
import { LayoutWorkspace } from "./components/LayoutWorkspace";
import { ManifoldEditModal } from "./components/ManifoldEditModal";
import { PumpEditModal } from "./components/PumpEditModal";
import { PumpReserve } from "./components/PumpReserve";
import { PumpUnitCard } from "./components/PumpUnitCard";
import { createDefaultManifolds } from "./data/defaultManifolds";
import { createDefaultPumps } from "./data/defaultPumps";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Manifold, Pump, SetNumber, WellStageContext } from "./models";
import {
  applyPumpEdits,
  getBenchPumps,
  getPumpStats,
  movePumpToBench,
  parseSlotDropId,
  placePumpInSlot,
  SlotTarget,
} from "./utils/layoutState";

const PUMPS_STORAGE_KEY = "halliburton-frac-layout-pumps-v2";
const MANIFOLDS_STORAGE_KEY = "halliburton-frac-layout-manifolds-v2";
const SET_STORAGE_KEY = "halliburton-frac-layout-selected-set-v1";
const WELL_STAGE_STORAGE_KEY = "halliburton-frac-layout-well-stage-v1";

function getFullscreenState() {
  return typeof document !== "undefined" && Boolean(document.fullscreenElement);
}

function findPump(pumps: Pump[], pumpId: string | null) {
  return pumps.find((pump) => pump.id === pumpId) ?? null;
}

function findManifold(manifolds: Manifold[], manifoldId: string | null) {
  return manifolds.find((manifold) => manifold.id === manifoldId) ?? null;
}

function createEntityId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createManifoldLabel(manifolds: Manifold[], type: Manifold["type"]) {
  const nextIndex = manifolds.filter((manifold) => manifold.type === type).length + 1;
  const prefix = type === "clean" ? "MFC" : "MFD";

  return `${prefix}-${String(nextIndex).padStart(2, "0")}`;
}

function createEmptyWellStageContext(): WellStageContext {
  return {
    mode: "single",
    pad: "",
    primary: {
      well: "",
      stage: "",
    },
    secondary: {
      well: "",
      stage: "",
    },
  };
}

export default function AppShell() {
  const [pumps, setPumps] = useLocalStorage<Pump[]>(
    PUMPS_STORAGE_KEY,
    createDefaultPumps,
    2,
  );
  const [manifolds, setManifolds] = useLocalStorage<Manifold[]>(
    MANIFOLDS_STORAGE_KEY,
    createDefaultManifolds,
    2,
  );
  const [selectedSet, setSelectedSet] = useLocalStorage<SetNumber>(
    SET_STORAGE_KEY,
    1,
    1,
  );
  const [stageContext, setStageContext] = useLocalStorage<WellStageContext>(
    WELL_STAGE_STORAGE_KEY,
    createEmptyWellStageContext,
    1,
  );
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [selectedManifoldId, setSelectedManifoldId] = useState<string | null>(null);
  const [addPumpTarget, setAddPumpTarget] = useState<SlotTarget | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(getFullscreenState);
  const [isAddPumpOpen, setIsAddPumpOpen] = useState(false);
  const [isAddManifoldOpen, setIsAddManifoldOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [layoutNotice, setLayoutNotice] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(getFullscreenState());
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setPumps((currentPumps) => {
      const needsDgbDefaults = currentPumps.some(
        (pump) =>
          typeof pump.isDgb !== "boolean" ||
          !Number.isInteger(pump.substitutionPercentage) ||
          pump.substitutionPercentage < 0 ||
          pump.substitutionPercentage > 100 ||
          typeof pump.substitutionError !== "string" ||
          (pump.signalColumnCount !== 3 && pump.signalColumnCount !== 5),
      );

      if (!needsDgbDefaults) {
        return currentPumps;
      }

      return currentPumps.map((pump) => ({
        ...pump,
        isDgb: pump.isDgb === true,
        substitutionPercentage:
          pump.isDgb === true &&
          Number.isInteger(pump.substitutionPercentage) &&
          pump.substitutionPercentage >= 0 &&
          pump.substitutionPercentage <= 100
            ? pump.substitutionPercentage
            : 0,
        substitutionError:
          pump.isDgb === true && typeof pump.substitutionError === "string"
            ? pump.substitutionError
            : "",
        signalColumnCount: pump.signalColumnCount === 5 ? 5 : 3,
      }));
    });
  }, [setPumps]);

  useEffect(() => {
    if (!layoutNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLayoutNotice(null);
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layoutNotice]);

  const benchPumps = getBenchPumps(pumps);
  const stats = getPumpStats(pumps);
  const selectedPump = findPump(pumps, selectedPumpId);
  const selectedManifold = findManifold(manifolds, selectedManifoldId);
  const activePump = findPump(pumps, activeDragId);

  function handleDragStart(event: DragStartEvent) {
    const pumpId = String(event.active.id);
    setActiveDragId(pumpId);

    if (selectedPumpId === pumpId) {
      setSelectedPumpId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const pumpId = String(event.active.id);
    const currentPump = findPump(pumps, pumpId);
    const dropId = event.over ? String(event.over.id) : null;
    const slotTarget = parseSlotDropId(dropId);

    setActiveDragId(null);

    if (!currentPump) {
      return;
    }

    if (!dropId || dropId === "zone-bench") {
      if (currentPump.side === "bench") {
        return;
      }

      startTransition(() => {
        setPumps(movePumpToBench(pumps, pumpId));
        setLayoutNotice(null);
      });
      return;
    }

    if (!slotTarget) {
      startTransition(() => {
        setPumps(movePumpToBench(pumps, pumpId));
      });
      setLayoutNotice(null);
      return;
    }

    const result = placePumpInSlot(pumps, manifolds, pumpId, slotTarget);

    startTransition(() => {
      if (!result.error) {
        setPumps(result.pumps);
      }

      setLayoutNotice(result.error);
    });
  }

  function handleToggleFullscreen() {
    const run = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          return;
        }

        await document.exitFullscreen();
      } catch (error) {
        console.warn("No se pudo cambiar a pantalla completa:", error);
      }
    };

    void run();
  }

  function handleSavePump(updatedPump: Pump) {
    const result = applyPumpEdits(pumps, manifolds, updatedPump);

    startTransition(() => {
      if (!result.error) {
        setPumps(result.pumps);
        setSelectedPumpId(null);
      }

      setLayoutNotice(result.error);
    });

    return result.error;
  }

  function handleDeletePump(pumpId: string) {
    startTransition(() => {
      setPumps((currentPumps) => currentPumps.filter((pump) => pump.id !== pumpId));
    });

    setSelectedPumpId(null);
    setActiveDragId(null);
    setLayoutNotice("Bomba eliminada del layout.");
  }

  function handleAddPump(values: {
    sap: string;
    operationState: Pump["operationState"];
    nonOperationalReason: Pump["nonOperationalReason"];
    isDgb: boolean;
    substitutionPercentage: number;
    substitutionError: string;
    signalColumnCount: Pump["signalColumnCount"];
    signals: Pump["signals"];
  }) {
    const benchCount = pumps.filter((pump) => pump.side === "bench").length;
    const newPump: Pump = {
      id: createEntityId("pump"),
      sap: values.sap,
      side: "bench",
      manifoldId: null,
      row: benchCount,
      connection: "none",
      operationState: values.operationState,
      nonOperationalReason: values.nonOperationalReason,
      position: benchCount + 1,
      isDgb: values.isDgb,
      substitutionPercentage: values.substitutionPercentage,
      substitutionError: values.substitutionError,
      signalColumnCount: values.signalColumnCount,
      signals: values.signals,
    };
    const nextPumps = [...pumps, newPump];
    const placementResult = addPumpTarget
      ? placePumpInSlot(nextPumps, manifolds, newPump.id, addPumpTarget)
      : { error: null, pumps: nextPumps };

    if (placementResult.error) {
      setLayoutNotice(placementResult.error);
      return;
    }

    startTransition(() => {
      setPumps(placementResult.pumps);
    });

    setLayoutNotice(addPumpTarget ? "Bomba agregada al slot seleccionado." : null);
    setAddPumpTarget(null);
    setIsAddPumpOpen(false);
  }

  function handleAddManifold(values: {
    type: Manifold["type"];
    pumpsPerSide: number;
  }) {
    startTransition(() => {
      setManifolds((currentManifolds) => [
        ...currentManifolds,
        {
          id: createEntityId("manifold"),
          label: createManifoldLabel(currentManifolds, values.type),
          type: values.type,
          pumpsPerSide: values.pumpsPerSide,
        },
      ]);
    });

    setLayoutNotice(null);
    setIsAddManifoldOpen(false);
  }

  function handleSaveManifold(updatedManifold: Manifold) {
    const occupiedPositions = pumps
      .filter(
        (pump) => pump.side !== "bench" && pump.manifoldId === updatedManifold.id,
      )
      .map((pump) => pump.position);
    const highestOccupiedPosition =
      occupiedPositions.length > 0 ? Math.max(...occupiedPositions) : 0;

    if (updatedManifold.pumpsPerSide < highestOccupiedPosition) {
      return `No se pueden reducir los slots a ${updatedManifold.pumpsPerSide}: hay una bomba en el slot ${highestOccupiedPosition}.`;
    }

    startTransition(() => {
      setManifolds((currentManifolds) =>
        currentManifolds.map((manifold) =>
          manifold.id === updatedManifold.id ? updatedManifold : manifold,
        ),
      );
      setPumps((currentPumps) =>
        currentPumps.map((pump) =>
          pump.manifoldId === updatedManifold.id && pump.connection !== "none"
            ? { ...pump, connection: updatedManifold.type }
            : pump,
        ),
      );
    });

    setSelectedManifoldId(null);
    setLayoutNotice("Manifold actualizado.");

    return null;
  }

  function handleSaveLayout() {
    if (!window.confirm("Esta de acuerdo con guardar el layout tal como esta configurado?")) {
      return;
    }

    setLayoutNotice("Layout guardado en este equipo.");
  }

  function handleClearLayout() {
    if (
      !window.confirm(
        "Esta de acuerdo con limpiar el layout? Se borraran todas las bombas y se conservaran los manifolds.",
      )
    ) {
      return;
    }

    startTransition(() => {
      setPumps([]);
    });

    setSelectedPumpId(null);
    setSelectedManifoldId(null);
    setAddPumpTarget(null);
    setActiveDragId(null);
    setIsAddPumpOpen(false);
    setIsAddManifoldOpen(false);
    setLayoutNotice("Layout limpio. Se conservaron los manifolds y se borraron las bombas.");
  }

  async function handleDownloadExcel() {
    setIsExporting(true);

    try {
      const { exportLayoutWorkbook } = await import("./utils/exportLayoutWorkbook");
      const fileName = await exportLayoutWorkbook({
        manifolds,
        pumps,
        selectedSet,
        stageContext,
      });

      setLayoutNotice(`Excel descargado: ${fileName}`);
    } catch (error) {
      console.warn("No se pudo generar el archivo Excel:", error);
      setLayoutNotice("No se pudo generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div className="min-h-screen">
        <main className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-5 px-4 py-4 md:px-6 md:py-6 xl:px-8">
          <ControlHeader
            selectedSet={selectedSet}
            totalInSet={stats.totalInSet}
            operativeInSetCount={stats.operativeInSetCount}
            operativeOutOfSetCount={stats.operativeOutOfSetCount}
            nonOperativeInSetCount={stats.nonOperativeInSetCount}
            nonOperativeOutOfSetCount={stats.nonOperativeOutOfSetCount}
            dgbInSetCount={stats.dgbInSetCount}
            nonDgbInSetCount={stats.nonDgbInSetCount}
            substitutingDgbInSetCount={stats.substitutingDgbInSetCount}
            nonSubstitutingDgbInSetCount={stats.nonSubstitutingDgbInSetCount}
            dgbSubstitutionPercentage={stats.dgbSubstitutionPercentage}
            stageContext={stageContext}
            onSetChange={setSelectedSet}
            onStageContextChange={setStageContext}
            onOpenAddPump={() => {
              setAddPumpTarget(null);
              setIsAddPumpOpen(true);
            }}
            onOpenAddManifold={() => setIsAddManifoldOpen(true)}
            onSaveLayout={handleSaveLayout}
            onClearLayout={handleClearLayout}
            onDownloadExcel={() => {
              void handleDownloadExcel();
            }}
            onToggleFullscreen={handleToggleFullscreen}
            isExporting={isExporting}
            isFullscreen={isFullscreen}
          />

          <LayoutWorkspace
            pumps={pumps}
            manifolds={manifolds}
            notice={layoutNotice}
            selectedPumpId={selectedPumpId}
            onAddPumpToSlot={(target) => {
              setAddPumpTarget(target);
              setIsAddPumpOpen(true);
            }}
            onEditManifold={setSelectedManifoldId}
            onSelectPump={setSelectedPumpId}
          />

          <PumpReserve
            pumps={benchPumps}
            selectedPumpId={selectedPumpId}
            onSelectPump={setSelectedPumpId}
          />

          <footer
            aria-label="Acerca de OCTIV"
            className="flex flex-col gap-2 rounded-[1.5rem] border border-slate-800/80 bg-slate-950/35 px-5 py-4 text-slate-400 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Acerca de OCTIV
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-300">
                {APP_AUTHOR_CREDIT}
              </p>
            </div>
            <p className="text-xs font-semibold tracking-[0.16em]">
              {APP_VERSION_LABEL}
            </p>
          </footer>

          <PumpEditModal
            pump={selectedPump}
            onClose={() => setSelectedPumpId(null)}
            onDelete={handleDeletePump}
            onSave={handleSavePump}
          />

          <ManifoldEditModal
            manifold={selectedManifold}
            onClose={() => setSelectedManifoldId(null)}
            onSave={handleSaveManifold}
          />

          <AddPumpModal
            destinationMessage={
              addPumpTarget
                ? `La bomba nueva se ubicara directamente en el slot ${addPumpTarget.position} del lado ${
                    addPumpTarget.side === "left" ? "izquierdo" : "derecho"
                  }.`
                : null
            }
            isOpen={isAddPumpOpen}
            onClose={() => {
              setAddPumpTarget(null);
              setIsAddPumpOpen(false);
            }}
            onAddPump={handleAddPump}
          />

          <AddManifoldModal
            isOpen={isAddManifoldOpen}
            onClose={() => setIsAddManifoldOpen(false)}
            onAddManifold={handleAddManifold}
          />
        </main>
      </div>

      <DragOverlay adjustScale={false}>
        {activePump ? (
          <div className="w-[24rem] max-w-[90vw] opacity-95">
            <PumpUnitCard
              pump={activePump}
              onSelect={() => undefined}
              draggable={false}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
