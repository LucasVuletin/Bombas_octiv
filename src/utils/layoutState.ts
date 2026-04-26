import { MAX_PUMP_POSITION, Manifold, Pump, PumpSide } from "../models";

type PumpMutationResult = {
  error: string | null;
  pumps: Pump[];
};

export type SlotTarget = {
  manifoldId: string;
  position: number;
  side: Exclude<PumpSide, "bench">;
};

export type ManifoldSlot = {
  position: number;
  pump: Pump | null;
};

function getMaxSlotCount(manifold: Manifold) {
  return Math.min(manifold.pumpsPerSide, MAX_PUMP_POSITION);
}

function sortBenchPumps(pumps: Pump[]) {
  return [...pumps].sort((firstPump, secondPump) => {
    if (firstPump.row !== secondPump.row) {
      return firstPump.row - secondPump.row;
    }

    return firstPump.position - secondPump.position;
  });
}

function sortZonePumps(pumps: Pump[]) {
  return [...pumps].sort((firstPump, secondPump) => firstPump.position - secondPump.position);
}

function refreshPumpRows(pumps: Pump[]) {
  const benchPumps = sortBenchPumps(pumps.filter((pump) => pump.side === "bench")).map(
    (pump, index) => ({
      ...pump,
      row: index,
    }),
  );
  const activePumps = pumps
    .filter((pump) => pump.side !== "bench")
    .map((pump) => ({
      ...pump,
      row: pump.position - 1,
    }));

  return [...activePumps, ...benchPumps];
}

function buildZonePumpMap(pumps: Pump[], manifoldId: string, side: Exclude<PumpSide, "bench">) {
  return new Map(
    pumps
      .filter((pump) => pump.side === side && pump.manifoldId === manifoldId)
      .map((pump) => [pump.position, pump] as const),
  );
}

function getManifoldById(manifolds: Manifold[], manifoldId: string) {
  return manifolds.find((manifold) => manifold.id === manifoldId) ?? null;
}

function resolveConnectedState(pump: Pump, manifold: Manifold) {
  if (pump.side === "bench" || pump.manifoldId === null) {
    return manifold.type;
  }

  if (pump.connection === "none") {
    return "none" as const;
  }

  return manifold.type;
}

export function getBenchPumps(pumps: Pump[]) {
  return sortBenchPumps(pumps.filter((pump) => pump.side === "bench"));
}

export function getPumpStats(pumps: Pump[]) {
  const inSet = pumps.filter((pump) => pump.side !== "bench");

  return {
    totalInSet: inSet.length,
    operativeCount: pumps.filter((pump) => pump.operationState === "operative").length,
    nonOperativeCount: pumps.filter((pump) => pump.operationState === "non-operative")
      .length,
    benchCount: pumps.filter((pump) => pump.side === "bench").length,
  };
}

export function buildManifoldSlots(
  manifolds: Manifold[],
  pumps: Pump[],
  manifoldId: string,
  side: Exclude<PumpSide, "bench">,
) {
  const manifold = getManifoldById(manifolds, manifoldId);

  if (!manifold) {
    return [] as ManifoldSlot[];
  }

  const maxSlots = getMaxSlotCount(manifold);
  const zonePumpMap = buildZonePumpMap(pumps, manifoldId, side);

  return Array.from({ length: maxSlots }, (_, index) => ({
    position: index + 1,
    pump: zonePumpMap.get(index + 1) ?? null,
  }));
}

export function createSlotDropId(target: SlotTarget) {
  return `slot:${target.manifoldId}:${target.side}:${target.position}`;
}

export function parseSlotDropId(dropId: string | null) {
  if (!dropId || !dropId.startsWith("slot:")) {
    return null;
  }

  const [, manifoldId, side, position] = dropId.split(":");

  if (!manifoldId || (side !== "left" && side !== "right")) {
    return null;
  }

  const parsedPosition = Number(position);

  if (!Number.isInteger(parsedPosition)) {
    return null;
  }

  return {
    manifoldId,
    position: parsedPosition,
    side,
  } as SlotTarget;
}

export function movePumpToBench(pumps: Pump[], pumpId: string): Pump[] {
  const benchCount = pumps.filter((pump) => pump.side === "bench" && pump.id !== pumpId).length;

  return refreshPumpRows(
    pumps.map((pump) =>
      pump.id === pumpId
        ? {
            ...pump,
            side: "bench",
            manifoldId: null,
            connection: "none",
            position: benchCount + 1,
            row: benchCount,
          }
        : pump,
    ),
  );
}

export function placePumpInSlot(
  pumps: Pump[],
  manifolds: Manifold[],
  pumpId: string,
  target: SlotTarget,
): PumpMutationResult {
  const activePump = pumps.find((pump) => pump.id === pumpId);
  const manifold = getManifoldById(manifolds, target.manifoldId);

  if (!activePump || !manifold) {
    return {
      error: "No se pudo ubicar la bomba en el manifold seleccionado.",
      pumps,
    };
  }

  const maxSlots = getMaxSlotCount(manifold);

  if (target.position < 1 || target.position > maxSlots) {
    return {
      error: `El manifold ${manifold.label} admite posiciones del 1 al ${maxSlots} por lado.`,
      pumps,
    };
  }

  if (
    activePump.side === target.side &&
    activePump.manifoldId === target.manifoldId &&
    activePump.position === target.position
  ) {
    return {
      error: null,
      pumps: refreshPumpRows(pumps),
    };
  }

  const remainingPumps = pumps.filter((pump) => pump.id !== pumpId);
  const zonePumpMap = buildZonePumpMap(remainingPumps, target.manifoldId, target.side);
  const nextPumps = [...remainingPumps];

  if (zonePumpMap.has(target.position)) {
    let gapPosition = target.position;

    while (gapPosition <= maxSlots && zonePumpMap.has(gapPosition)) {
      gapPosition += 1;
    }

    if (gapPosition > maxSlots) {
      return {
        error: `No hay espacio libre para insertar en ${manifold.label} lado ${
          target.side === "left" ? "izquierdo" : "derecho"
        }.`,
        pumps,
      };
    }

    for (let currentPosition = gapPosition - 1; currentPosition >= target.position; currentPosition -= 1) {
      const pumpToShift = zonePumpMap.get(currentPosition);

      if (!pumpToShift) {
        continue;
      }

      const pumpIndex = nextPumps.findIndex((pump) => pump.id === pumpToShift.id);

      if (pumpIndex >= 0) {
        nextPumps[pumpIndex] = {
          ...nextPumps[pumpIndex],
          position: currentPosition + 1,
          row: currentPosition,
        };
      }
    }
  }

  nextPumps.push({
    ...activePump,
    side: target.side,
    manifoldId: target.manifoldId,
    position: target.position,
    row: target.position - 1,
    connection: resolveConnectedState(activePump, manifold),
  });

  return {
    error: null,
    pumps: refreshPumpRows(nextPumps),
  };
}

export function applyPumpEdits(
  pumps: Pump[],
  manifolds: Manifold[],
  updatedPump: Pump,
): PumpMutationResult {
  const currentPump = pumps.find((pump) => pump.id === updatedPump.id);

  if (!currentPump) {
    return {
      error: "No se encontro la bomba seleccionada.",
      pumps,
    };
  }

  const mergedPump = {
    ...currentPump,
    ...updatedPump,
  };

  if (mergedPump.side === "bench" || !mergedPump.manifoldId) {
    return {
      error: null,
      pumps: refreshPumpRows(
        pumps.map((pump) =>
          pump.id === mergedPump.id
            ? {
                ...mergedPump,
                side: "bench",
                manifoldId: null,
                connection: "none",
              }
            : pump,
        ),
      ),
    };
  }

  const manifold = getManifoldById(manifolds, mergedPump.manifoldId);

  if (!manifold) {
    return {
      error: "El manifold asignado a la bomba ya no existe.",
      pumps,
    };
  }

  if (mergedPump.position > getMaxSlotCount(manifold)) {
    return {
      error: `La posicion ${mergedPump.position} excede la capacidad de ${manifold.label}.`,
      pumps,
    };
  }

  const nextPumps = pumps.map((pump) =>
    pump.id === mergedPump.id
      ? {
          ...mergedPump,
          connection: resolveConnectedState(mergedPump, manifold),
        }
      : pump,
  );

  return placePumpInSlot(nextPumps, manifolds, mergedPump.id, {
    manifoldId: mergedPump.manifoldId,
    position: mergedPump.position,
    side: mergedPump.side,
  });
}

export function getLayoutMessageCapacity(manifold: Manifold) {
  return getMaxSlotCount(manifold);
}
