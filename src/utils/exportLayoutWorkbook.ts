import writeXlsxFile, { Cell, SheetData } from "write-excel-file/browser";
import { APP_AUTHOR_NAME, APP_VERSION } from "../appIdentity";
import {
  getNonOperationalReasonLabel,
  Manifold,
  Pump,
  SetNumber,
  SIDE_LABELS,
  WellStageContext,
} from "../models";
import { getPumpStats } from "./layoutState";

type ExportLayoutWorkbookInput = {
  manifolds: Manifold[];
  pumps: Pump[];
  selectedSet: SetNumber;
  stageContext: WellStageContext;
};

type RecommendationRow = [string, string, string, string];

const RECOMMENDED_FIELDS: RecommendationRow[] = [
  ["Identificacion", "Fecha y hora de captura", "Agregar por snapshot/evento", "Permite construir series temporales y anticipar fallas."],
  ["Identificacion", "Pad, pozo y etapa", "Disponible ahora", "Segmenta resultados por trabajo y permite comparar etapas."],
  ["Configuracion", "Set, SAP, manifold, lado y slot", "Disponible ahora", "Reconstruye la configuracion fisica de cada bomba."],
  ["Estado", "Operativa, motivo no operativa y error DGB", "Disponible ahora", "Define eventos de indisponibilidad y causas."],
  ["DGB", "Tiene DGB y porcentaje de sustitucion", "Disponible ahora", "Mide el resultado principal de sustitucion."],
  ["Senales bomba", "P, D y S", "Disponible ahora", "Variables de condicion de la bomba en el snapshot."],
  ["Tratamiento", "Caudal total y caudal asignado a cada pozo", "Agregar", "Explica demanda real y distribucion en Dual/Simul."],
  ["Tratamiento", "Presion de tratamiento, presion de linea y setpoints", "Agregar", "Captura condiciones que preceden degradacion."],
  ["Fluido", "Tipo de fluido, densidad, concentracion de arena y aditivos", "Agregar", "Ayuda a diferenciar desgaste por receta de bombeo."],
  ["Equipo", "RPM, carga, temperaturas, vibracion y alarmas", "Agregar", "Mejora la prediccion temprana de falla."],
  ["Mantenimiento", "Horas acumuladas, reparacion previa y componentes cambiados", "Agregar", "Relaciona degradacion con historial del activo."],
  ["Objetivo modelo", "Falla o perdida de sustitucion en los proximos N minutos", "Definir", "Evita entrenar sin un objetivo predictivo medible."],
];

function headerCell(value: string): Cell {
  return {
    value,
    fontWeight: "bold",
    textColor: "#FFFFFF",
    backgroundColor: "#132238",
    borderColor: "#7FB3C8",
    borderStyle: "thin",
    align: "center",
    alignVertical: "center",
    wrap: true,
    height: 34,
  };
}

function titleCell(value: string, span: number): Cell {
  return {
    value,
    columnSpan: span,
    fontSize: 16,
    fontWeight: "bold",
    textColor: "#FFFFFF",
    backgroundColor: "#24475A",
    alignVertical: "center",
    height: 32,
  };
}

function dateCell(value: Date): Cell {
  return {
    value,
    type: Date,
    format: "dd/mm/yyyy hh:mm:ss",
  };
}

function createFileSlug(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug || "layout";
}

function toYesNo(value: boolean) {
  return value ? "Si" : "No";
}

function toContextValue(value: string) {
  return value.trim() || "Sin cargar";
}

function createLocalTimestamp(value: Date) {
  const pad = (entry: number) => String(entry).padStart(2, "0");

  return [
    value.getFullYear(),
    pad(value.getMonth() + 1),
    pad(value.getDate()),
    pad(value.getHours()),
    pad(value.getMinutes()),
  ].join("");
}

export async function exportLayoutWorkbook({
  manifolds,
  pumps,
  selectedSet,
  stageContext,
}: ExportLayoutWorkbookInput) {
  const exportDate = new Date();
  const stats = getPumpStats(pumps);
  const manifoldById = new Map(manifolds.map((manifold) => [manifold.id, manifold]));
  const secondaryEnabled = stageContext.mode === "dual-simul";
  const modeLabel = secondaryEnabled ? "Dual / Simul" : "Zipper";
  const padLabel = toContextValue(stageContext.pad ?? "");

  const summaryData: SheetData = [
    [titleCell("OCTIV - Resumen de pozo y etapa", 4), null, null, null],
    ["Desarrollado por", APP_AUTHOR_NAME, "Version", APP_VERSION],
    ["Exportado", dateCell(exportDate), "", ""],
    ["SET", selectedSet, "Modalidad", modeLabel],
    ["Pad", padLabel, "", ""],
    ["Pozo 1", toContextValue(stageContext.primary.well), "Etapa 1", toContextValue(stageContext.primary.stage)],
    [
      "Pozo 2",
      secondaryEnabled ? toContextValue(stageContext.secondary.well) : "No aplica",
      "Etapa 2",
      secondaryEnabled ? toContextValue(stageContext.secondary.stage) : "No aplica",
    ],
    [],
    [headerCell("Indicador"), headerCell("Valor")],
    ["Bombas en set", stats.totalInSet],
    ["Operativas en set", stats.operativeInSetCount],
    ["No operativas en set", stats.nonOperativeInSetCount],
    ["Operativas fuera de set", stats.operativeOutOfSetCount],
    ["No operativas fuera de set", stats.nonOperativeOutOfSetCount],
    ["Bombas con DGB", stats.dgbInSetCount],
    ["Bombas sin DGB", stats.nonDgbInSetCount],
    ["Bombas sustituyendo", stats.substitutingDgbInSetCount],
    ["Bombas sin sustituir", stats.nonSubstitutingDgbInSetCount],
    ["Sustitucion DGB (%)", stats.dgbSubstitutionPercentage],
  ];

  const pumpHeaders = [
    "Fecha exportacion",
    "Pad",
    "SET",
    "Modalidad",
    "Pozo 1",
    "Etapa 1",
    "Pozo 2",
    "Etapa 2",
    "SAP",
    "En set",
    "Manifold",
    "Tipo manifold",
    "Lado",
    "Slot",
    "Estado",
    "Motivo no operativa",
    "DGB",
    "Sustitucion (%)",
    "Sustituyendo",
    "Error DGB",
    "P",
    "D",
    "S",
    "Columnas P/D/S",
    "Linea",
  ];
  const pumpData: SheetData = [pumpHeaders.map(headerCell)];

  pumps.forEach((pump) => {
    const manifold = pump.manifoldId ? manifoldById.get(pump.manifoldId) : undefined;
    const inSet = pump.side !== "bench";

    pumpData.push([
      dateCell(exportDate),
      stageContext.pad?.trim() ?? "",
      selectedSet,
      modeLabel,
      stageContext.primary.well.trim(),
      stageContext.primary.stage.trim(),
      secondaryEnabled ? stageContext.secondary.well.trim() : "",
      secondaryEnabled ? stageContext.secondary.stage.trim() : "",
      pump.sap,
      toYesNo(inSet),
      manifold?.label ?? "",
      manifold?.type === "clean" ? "Limpio" : manifold?.type === "dirty" ? "Sucio" : "",
      SIDE_LABELS[pump.side],
      inSet ? pump.position : "",
      pump.operationState === "operative" ? "Operativa" : "No operativa",
      pump.nonOperationalReason ? getNonOperationalReasonLabel(pump.nonOperationalReason) : "",
      toYesNo(pump.isDgb === true),
      pump.isDgb === true ? pump.substitutionPercentage : 0,
      toYesNo(pump.isDgb === true && pump.substitutionPercentage > 0),
      pump.substitutionError,
      pump.signals.p,
      pump.signals.d,
      pump.signals.s,
      pump.signalColumnCount === 5 ? 5 : 3,
      pump.connection === "clean"
        ? "Limpio"
        : pump.connection === "dirty"
          ? "Sucio"
          : "Sin linea",
    ]);
  });

  const manifoldData: SheetData = [
    ["Manifold", "Tipo", "Slots por lado", "Bombas asignadas", "Operativas", "No operativas"].map(headerCell),
  ];

  manifolds.forEach((manifold) => {
    const assignedPumps = pumps.filter(
      (pump) => pump.side !== "bench" && pump.manifoldId === manifold.id,
    );

    manifoldData.push([
      manifold.label,
      manifold.type === "clean" ? "Limpio" : "Sucio",
      manifold.pumpsPerSide,
      assignedPumps.length,
      assignedPumps.filter((pump) => pump.operationState === "operative").length,
      assignedPumps.filter((pump) => pump.operationState === "non-operative").length,
    ]);
  });

  const dictionaryData: SheetData = [
    ["Grupo", "Campo recomendado", "Estado", "Uso para trazabilidad y prediccion"].map(headerCell),
    ...RECOMMENDED_FIELDS,
  ];
  const fileDate = createLocalTimestamp(exportDate);
  const fileName = `OCTIV_${createFileSlug((stageContext.pad ?? "").trim() || stageContext.primary.well)}_${fileDate}.xlsx`;

  await writeXlsxFile(
    [
      {
        data: summaryData,
        sheet: "Resumen",
        columns: [{ width: 29 }, { width: 28 }, { width: 20 }, { width: 28 }],
        stickyRowsCount: 1,
        showGridLines: false,
      },
      {
        data: pumpData,
        sheet: "Bombas",
        columns: [
          { width: 21 }, { width: 20 }, { width: 8 }, { width: 14 }, { width: 20 }, { width: 12 },
          { width: 20 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 16 }, { width: 16 },
          { width: 16 }, { width: 8 }, { width: 16 }, { width: 25 }, { width: 10 }, { width: 17 },
          { width: 15 }, { width: 34 }, { width: 9 }, { width: 9 }, { width: 9 }, { width: 17 },
          { width: 14 },
        ],
        stickyRowsCount: 1,
        showGridLines: false,
      },
      {
        data: manifoldData,
        sheet: "Manifolds",
        columns: [{ width: 18 }, { width: 14 }, { width: 18 }, { width: 20 }, { width: 14 }, { width: 18 }],
        stickyRowsCount: 1,
        showGridLines: false,
      },
      {
        data: dictionaryData,
        sheet: "Datos para analisis",
        columns: [{ width: 20 }, { width: 48 }, { width: 26 }, { width: 72 }],
        stickyRowsCount: 1,
        showGridLines: false,
      },
    ],
    {
      fontFamily: "Calibri",
      fontSize: 11,
    },
  ).toFile(fileName);

  return fileName;
}
