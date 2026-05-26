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
import { ControlHeader } from "./components/ControlHeader";
import { LayoutWorkspace } from "./components/LayoutWorkspace";
import { PumpEditModal } from "./components/PumpEditModal";
import { PumpReserve } from "./components/PumpReserve";
import { PumpUnitCard } from "./components/PumpUnitCard";
import { createDefaultManifolds } from "./data/defaultManifolds";
import { createDefaultPumps } from "./data/defaultPumps";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Manifold, Pump, PumpSignalColumnCount, SetNumber } from "./models";
import {
  applyPumpEdits,
  getBenchPumps,
  getPumpStats,
  movePumpToBench,
  parseSlotDropId,
  placePumpInSlot,
} from "./utils/layoutState";

const PUMPS_STORAGE_KEY = "halliburton-frac-layout-pumps-v2";
const MANIFOLDS_STORAGE_KEY = "halliburton-frac-layout-manifolds-v2";
const SET_STORAGE_KEY = "halliburton-frac-layout-selected-set-v1";
const SIGNAL_COLUMNS_STORAGE_KEY = "halliburton-frac-layout-signal-columns-v1";

function getFullscreenState() {
  return typeof document !== "undefined" && Boolean(document.fullscreenElement);
}

function findPump(pumps: Pump[], pumpId: string | null) {
  return pumps.find((pump) => pump.id === pumpId) ?? null;
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
  const [signalColumnCount, setSignalColumnCount] = useLocalStorage<PumpSignalColumnCount>(
    SIGNAL_COLUMNS_STORAGE_KEY,
    3,
    1,
  );
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(getFullscreenState);
  const [isAddPumpOpen, setIsAddPumpOpen] = useState(false);
  const [isAddManifoldOpen, setIsAddManifoldOpen] = useState(false);
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
          pump.substitutionPercentage > 100,
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
  const activePump = findPump(pumps, activeDragId);
  const visibleSignalColumnCount: PumpSignalColumnCount =
    signalColumnCount === 5 ? 5 : 3;

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
    position: number;
    isDgb: boolean;
    substitutionPercentage: number;
    signals: Pump["signals"];
  }) {
    startTransition(() => {
      setPumps((currentPumps) => {
        const benchCount = currentPumps.filter((pump) => pump.side === "bench").length;

        return [
          ...currentPumps,
          {
            id: createEntityId("pump"),
            sap: values.sap,
            side: "bench",
            manifoldId: null,
            row: benchCount,
            connection: "none",
            operationState: values.operationState,
            nonOperationalReason: values.nonOperationalReason,
            position: values.position,
            isDgb: values.isDgb,
            substitutionPercentage: values.substitutionPercentage,
            signals: values.signals,
          },
        ];
      });
    });

    setLayoutNotice(null);
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
    setActiveDragId(null);
    setIsAddPumpOpen(false);
    setIsAddManifoldOpen(false);
    setLayoutNotice("Layout limpio. Se conservaron los manifolds y se borraron las bombas.");
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
            signalColumnCount={visibleSignalColumnCount}
            totalInSet={stats.totalInSet}
            operativeInSetCount={stats.operativeInSetCount}
            operativeOutOfSetCount={stats.operativeOutOfSetCount}
            nonOperativeInSetCount={stats.nonOperativeInSetCount}
            nonOperativeOutOfSetCount={stats.nonOperativeOutOfSetCount}
            dgbSubstitutionPercentage={stats.dgbSubstitutionPercentage}
            onSetChange={setSelectedSet}
            onSignalColumnCountChange={setSignalColumnCount}
            onOpenAddPump={() => setIsAddPumpOpen(true)}
            onOpenAddManifold={() => setIsAddManifoldOpen(true)}
            onSaveLayout={handleSaveLayout}
            onClearLayout={handleClearLayout}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
          />

          <LayoutWorkspace
            pumps={pumps}
            manifolds={manifolds}
            signalColumnCount={visibleSignalColumnCount}
            notice={layoutNotice}
            selectedPumpId={selectedPumpId}
            onSelectPump={setSelectedPumpId}
          />

          <PumpReserve
            pumps={benchPumps}
            signalColumnCount={visibleSignalColumnCount}
            selectedPumpId={selectedPumpId}
            onSelectPump={setSelectedPumpId}
          />

          <PumpEditModal
            pump={selectedPump}
            onClose={() => setSelectedPumpId(null)}
            onDelete={handleDeletePump}
            onSave={handleSavePump}
          />

          <AddPumpModal
            isOpen={isAddPumpOpen}
            onClose={() => setIsAddPumpOpen(false)}
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
              signalColumnCount={visibleSignalColumnCount}
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
