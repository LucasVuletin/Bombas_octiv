import { Pump, PumpConnection, PumpStatus } from "../types";

type SeedPump = {
  unitNumber: string;
  side: Pump["side"];
  connection: PumpConnection;
  status: PumpStatus;
  notes: string;
};

const SEED_PUMPS: SeedPump[] = [
  {
    unitNumber: "852",
    side: "left",
    connection: "dirty",
    status: "operative",
    notes: "Cabecera A",
  },
  {
    unitNumber: "073",
    side: "left",
    connection: "clean",
    status: "operative",
    notes: "En bombeo",
  },
  {
    unitNumber: "1368",
    side: "left",
    connection: "clean",
    status: "standby",
    notes: "Lista para entrar",
  },
  {
    unitNumber: "8725",
    side: "left",
    connection: "dirty",
    status: "packing",
    notes: "Revisión de empaque",
  },
  {
    unitNumber: "8728",
    side: "left",
    connection: "clean",
    status: "maintenance",
    notes: "Mantenimiento programado",
  },
  {
    unitNumber: "8765",
    side: "left",
    connection: "dirty",
    status: "operative",
    notes: "Caudal estable",
  },
  {
    unitNumber: "451",
    side: "left",
    connection: "none",
    status: "stopped",
    notes: "Fuera de línea",
  },
  {
    unitNumber: "4934",
    side: "left",
    connection: "clean",
    status: "offline",
    notes: "Sin telemetría",
  },
  {
    unitNumber: "9125",
    side: "right",
    connection: "clean",
    status: "operative",
    notes: "Bombeando al limpio",
  },
  {
    unitNumber: "6775",
    side: "right",
    connection: "dirty",
    status: "standby",
    notes: "Reserva caliente",
  },
  {
    unitNumber: "2275",
    side: "right",
    connection: "dirty",
    status: "operative",
    notes: "Set derecho alto",
  },
  {
    unitNumber: "5685",
    side: "right",
    connection: "clean",
    status: "stopped",
    notes: "Parada manual",
  },
  {
    unitNumber: "1325",
    side: "right",
    connection: "clean",
    status: "operative",
    notes: "Listada para etapa siguiente",
  },
  {
    unitNumber: "8900",
    side: "right",
    connection: "none",
    status: "offline",
    notes: "Sin comunicación",
  },
  {
    unitNumber: "9032",
    side: "bench",
    connection: "none",
    status: "standby",
    notes: "Disponible",
  },
  {
    unitNumber: "4157",
    side: "bench",
    connection: "none",
    status: "maintenance",
    notes: "Chequeo rápido",
  },
  {
    unitNumber: "6118",
    side: "bench",
    connection: "none",
    status: "stopped",
    notes: "Fuera del set",
  },
  {
    unitNumber: "7740",
    side: "bench",
    connection: "none",
    status: "operative",
    notes: "Lista para ingresar",
  },
];

export function createInitialPumps(): Pump[] {
  const counters = {
    left: 0,
    right: 0,
    bench: 0,
  };

  return SEED_PUMPS.map((pump, index) => {
    const row = counters[pump.side];
    counters[pump.side] += 1;

    return {
      id: `pump-${index + 1}`,
      unitNumber: pump.unitNumber,
      side: pump.side,
      row,
      connection: pump.connection,
      status: pump.status,
      notes: pump.notes,
    };
  });
}
