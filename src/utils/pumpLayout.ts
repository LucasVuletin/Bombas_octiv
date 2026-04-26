import { Pump, PumpSide } from "../types";

export function sortPumpsByRow(pumps: Pump[]) {
  return [...pumps].sort((firstPump, secondPump) => firstPump.row - secondPump.row);
}

export function groupPumpsBySide(pumps: Pump[]) {
  return {
    left: sortPumpsByRow(pumps.filter((pump) => pump.side === "left")),
    right: sortPumpsByRow(pumps.filter((pump) => pump.side === "right")),
    bench: sortPumpsByRow(pumps.filter((pump) => pump.side === "bench")),
  };
}

export function normalizePumpRows(pumps: Pump[]) {
  const sides: PumpSide[] = ["left", "right", "bench"];

  return sides.flatMap((side) =>
    sortPumpsByRow(pumps.filter((pump) => pump.side === side)).map((pump, index) => ({
      ...pump,
      row: index,
    })),
  );
}

export function movePumpToSide(pumps: Pump[], pumpId: string, targetSide: PumpSide) {
  const nextPumps = pumps.map((pump) => {
    if (pump.id !== pumpId) {
      return pump;
    }

    const nextConnection: Pump["connection"] =
      targetSide === "bench"
        ? "none"
        : pump.connection === "none"
          ? "clean"
          : pump.connection;

    return {
      ...pump,
      side: targetSide,
      row: Number.MAX_SAFE_INTEGER,
      connection: nextConnection,
    };
  });

  // Recompacta filas después de cada movimiento para mantener un layout estable.
  return normalizePumpRows(nextPumps);
}

export function createRows(pumps: Pump[], minimumRows = 8) {
  const rowCount = Math.max(pumps.length, minimumRows);

  return Array.from({ length: rowCount }, (_, index) => pumps[index] ?? null);
}

export function getPumpStats(pumps: Pump[]) {
  const inSet = pumps.filter((pump) => pump.side !== "bench");

  return {
    totalInSet: inSet.length,
    operativeCount: pumps.filter((pump) => pump.status === "operative").length,
    stoppedCount: pumps.filter((pump) => pump.status === "stopped").length,
    benchCount: pumps.filter((pump) => pump.side === "bench").length,
  };
}
