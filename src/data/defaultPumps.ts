import {
  MAX_SIGNAL_VALUE,
  MIN_SIGNAL_VALUE,
  Pump,
  PumpConnection,
  PumpNonOperationalReason,
  PumpOperationState,
  PumpSignals,
} from "../models";
import {
  DEFAULT_CLEAN_MANIFOLD_ID,
  DEFAULT_DIRTY_MANIFOLD_ID,
} from "./defaultManifolds";

type SeedPump = {
  sap: string;
  side: Pump["side"];
  manifoldId: string | null;
  connection: PumpConnection;
  operationState: PumpOperationState;
  nonOperationalReason: PumpNonOperationalReason | null;
  position: number;
};

function createRandomSignalValue() {
  return Math.floor(Math.random() * (MAX_SIGNAL_VALUE - MIN_SIGNAL_VALUE + 1)) + MIN_SIGNAL_VALUE;
}

export function createMockSignals(): PumpSignals {
  return {
    p: createRandomSignalValue(),
    d: createRandomSignalValue(),
    s: createRandomSignalValue(),
  };
}

const SEED_PUMPS: SeedPump[] = [
  {
    sap: "0852",
    side: "left",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "dirty",
    operationState: "operative",
    nonOperationalReason: null,
    position: 1,
  },
  {
    sap: "0073",
    side: "left",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "operative",
    nonOperationalReason: null,
    position: 1,
  },
  {
    sap: "1368",
    side: "left",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "non-operative",
    nonOperationalReason: "cavitacion",
    position: 3,
  },
  {
    sap: "8725",
    side: "left",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "dirty",
    operationState: "non-operative",
    nonOperationalReason: "empaque",
    position: 2,
  },
  {
    sap: "8728",
    side: "left",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "non-operative",
    nonOperationalReason: "dpm",
    position: 5,
  },
  {
    sap: "8765",
    side: "left",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "dirty",
    operationState: "operative",
    nonOperationalReason: null,
    position: 4,
  },
  {
    sap: "0451",
    side: "left",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "none",
    operationState: "non-operative",
    nonOperationalReason: "no-encastra",
    position: 7,
  },
  {
    sap: "4934",
    side: "left",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "non-operative",
    nonOperationalReason: "dpm",
    position: 6,
  },
  {
    sap: "9125",
    side: "right",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "operative",
    nonOperationalReason: null,
    position: 1,
  },
  {
    sap: "6775",
    side: "right",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "dirty",
    operationState: "operative",
    nonOperationalReason: null,
    position: 1,
  },
  {
    sap: "2275",
    side: "right",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "dirty",
    operationState: "operative",
    nonOperationalReason: null,
    position: 3,
  },
  {
    sap: "5685",
    side: "right",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "non-operative",
    nonOperationalReason: "cavitacion",
    position: 2,
  },
  {
    sap: "1325",
    side: "right",
    manifoldId: DEFAULT_CLEAN_MANIFOLD_ID,
    connection: "clean",
    operationState: "operative",
    nonOperationalReason: null,
    position: 4,
  },
  {
    sap: "8900",
    side: "right",
    manifoldId: DEFAULT_DIRTY_MANIFOLD_ID,
    connection: "none",
    operationState: "non-operative",
    nonOperationalReason: "dpm",
    position: 6,
  },
  {
    sap: "9032",
    side: "bench",
    manifoldId: null,
    connection: "none",
    operationState: "operative",
    nonOperationalReason: null,
    position: 15,
  },
  {
    sap: "4157",
    side: "bench",
    manifoldId: null,
    connection: "none",
    operationState: "non-operative",
    nonOperationalReason: "dpm",
    position: 16,
  },
  {
    sap: "6118",
    side: "bench",
    manifoldId: null,
    connection: "none",
    operationState: "non-operative",
    nonOperationalReason: "no-encastra",
    position: 17,
  },
  {
    sap: "7740",
    side: "bench",
    manifoldId: null,
    connection: "none",
    operationState: "operative",
    nonOperationalReason: null,
    position: 18,
  },
];

export function createDefaultPumps(): Pump[] {
  const benchCounter = {
    value: 0,
  };

  return SEED_PUMPS.map((pump, index) => {
    const row =
      pump.side === "bench"
        ? (() => {
            const nextRow = benchCounter.value;
            benchCounter.value += 1;
            return nextRow;
          })()
        : pump.position - 1;

    return {
      id: `pump-${index + 1}`,
      sap: pump.sap,
      side: pump.side,
      manifoldId: pump.manifoldId,
      row,
      connection: pump.connection,
      operationState: pump.operationState,
      nonOperationalReason: pump.nonOperationalReason,
      position: pump.position,
      signals: createMockSignals(),
    };
  });
}
