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
import { Pump } from "./types";
import { createInitialPumps } from "./data/initialPumps";
import { LayoutCanvas } from "./components/LayoutCanvas";
import { PumpBench } from "./components/PumpBench";
import { PumpCard } from "./components/PumpCard";
import { PumpEditorModal } from "./components/PumpEditorModal";
import { TopBar } from "./components/TopBar";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getPumpStats, groupPumpsBySide, movePumpToSide } from "./utils/pumpLayout";

const STORAGE_KEY = "halliburton-frac-layout-v1";

function getFullscreenState() {
  return typeof document !== "undefined" && Boolean(document.fullscreenElement);
}

function getDropZoneFromId(dropZoneId: string | null) {
  switch (dropZoneId) {
    case "zone-left":
      return "left" as const;
    case "zone-right":
      return "right" as const;
    case "zone-bench":
      return "bench" as const;
    default:
      return null;
  }
}

function findPump(pumps: Pump[], pumpId: string | null) {
  return pumps.find((pump) => pump.id === pumpId) ?? null;
}

export default function App() {
  const [pumps, setPumps, resetPumps] = useLocalStorage<Pump[]>(
    STORAGE_KEY,
    createInitialPumps,
  );
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(getFullscreenState);

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

  const groupedPumps = groupPumpsBySide(pumps);
  const stats = getPumpStats(pumps);
  const selectedPump = findPump(pumps, selectedPumpId);
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
    const dropZone = getDropZoneFromId(event.over ? String(event.over.id) : null) ?? "bench";
    const currentPump = findPump(pumps, pumpId);

    setActiveDragId(null);

    if (!currentPump || currentPump.side === dropZone) {
      return;
    }

    // Si se suelta fuera del layout reconocido, la unidad vuelve al bench.
    startTransition(() => {
      setPumps((currentPumps) => movePumpToSide(currentPumps, pumpId, dropZone));
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
    startTransition(() => {
      setPumps((currentPumps) =>
        currentPumps.map((pump) => (pump.id === updatedPump.id ? updatedPump : pump)),
      );
    });

    setSelectedPumpId(null);
  }

  function handleResetLayout() {
    startTransition(() => {
      resetPumps();
    });

    setSelectedPumpId(null);
    setActiveDragId(null);
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
          <TopBar
            totalInSet={stats.totalInSet}
            operativeCount={stats.operativeCount}
            stoppedCount={stats.stoppedCount}
            benchCount={stats.benchCount}
            onReset={handleResetLayout}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
          />

          <LayoutCanvas
            leftPumps={groupedPumps.left}
            rightPumps={groupedPumps.right}
            selectedPumpId={selectedPumpId}
            onSelectPump={setSelectedPumpId}
          />

          <PumpBench
            pumps={groupedPumps.bench}
            selectedPumpId={selectedPumpId}
            onSelectPump={setSelectedPumpId}
          />

          <PumpEditorModal
            pump={selectedPump}
            onClose={() => setSelectedPumpId(null)}
            onSave={handleSavePump}
          />
        </main>
      </div>

      <DragOverlay adjustScale={false}>
        {activePump ? (
          <div className="w-[24rem] max-w-[90vw] opacity-95">
            <PumpCard
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
