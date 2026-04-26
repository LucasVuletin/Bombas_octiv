# Frac Layout HMI

Aplicacion web tactil construida con `React + TypeScript + Vite + Tailwind CSS` para representar un frac spread con manifolds centrales, bombas a izquierda y derecha, y una zona de bombas disponibles o fuera del set.

La app esta pensada para operacion local en Windows, en pantalla grande tactil de aproximadamente 32 pulgadas, sin backend y con persistencia en `localStorage`.

## Funcionalidades incluidas

- Header operativo con `OCTIV` y selector de `SET` del 1 al 6.
- Botonera tactil para `Agregar bomba`, `Agregar manifold`, `Pantalla completa` y `Reset layout`.
- Layout principal con manifolds centrales y bombas distribuidas a izquierda, derecha y bench.
- Drag & drop compatible con mouse y touch usando `dnd-kit`.
- Alta manual de bombas con validacion de `SAP`, estado, motivo y posicion.
- Alta manual de manifolds con validacion de tipo y cantidad de bombas por lado.
- Edicion manual de cada bomba mediante modal grande.
- Tarjetas de bomba simplificadas: estado, motivo si corresponde, `SAP` y `Posicion`.
- Lineas visuales sobrias hacia el manifold: celeste = limpio, marron = sucio, sin linea = desconectada.
- Contadores operativos en la barra superior.
- Guardado automatico en el navegador con `localStorage` para bombas, manifolds y set seleccionado.

## Requisitos

- Node.js 20 o superior
- npm
- Windows con Chrome o Edge
- Visual Studio Code opcional para desarrollo

## Instalacion

```bash
npm install
```

Si PowerShell bloquea `npm.ps1`, podes usar estas variantes equivalentes:

```bash
npm.cmd install
npm.cmd run dev
```

## Desarrollo local

```bash
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Vista previa de produccion local

1. Generar el build:

```bash
npm run build
```

2. Levantar la vista previa:

```bash
npm run preview
```

Abrir:

```text
http://localhost:4173
```

## Modo kiosco en Windows

### Chrome en desarrollo

```bash
chrome.exe --kiosk http://localhost:5173
```

### Chrome con preview/build local

```bash
chrome.exe --kiosk http://localhost:4173
```

### Edge en desarrollo

```bash
msedge.exe --kiosk http://localhost:5173 --edge-kiosk-type=fullscreen
```

### Edge con preview/build local

```bash
msedge.exe --kiosk http://localhost:4173 --edge-kiosk-type=fullscreen
```

Ejemplo con ruta explicita:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk http://localhost:5173
```

## Persistencia local

- Los cambios se guardan automaticamente en `localStorage`.
- Se persisten bombas, manifolds y el `SET` seleccionado.
- El boton `Reset layout` vuelve al layout inicial.
- La informacion queda almacenada en el navegador del equipo donde se usa la app.

## Estructura del proyecto

```text
src/
  App.tsx
  AppShell.tsx
  main.tsx
  index.css
  models.ts
  types.ts
  data/
    defaultPumps.ts
    defaultManifolds.ts
    initialPumps.ts
  components/
    AddManifoldModal.tsx
    AddPumpModal.tsx
    ConnectionLine.tsx
    ConnectionLineTone.tsx
    ControlHeader.tsx
    LayoutCanvas.tsx
    LayoutWorkspace.tsx
    Manifold.tsx
    ManifoldBank.tsx
    PumpBench.tsx
    PumpCard.tsx
    PumpEditModal.tsx
    PumpEditorModal.tsx
    PumpFormFields.tsx
    PumpReserve.tsx
    PumpUnitCard.tsx
    TopBar.tsx
  hooks/
    useLocalStorage.ts
  utils/
    layoutState.ts
    pumpLayout.ts
    validation.ts
```

## Scripts disponibles

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Notas de uso

- Para mover una bomba, arrastra el mango lateral.
- Para editar una bomba, toca o hace click sobre el cuerpo de la unidad.
- Si soltas una bomba fuera del layout activo, vuelve a `Bombas disponibles / fuera del set`.
- Las bombas nuevas se agregan primero al bench y luego pueden arrastrarse al set.
- Si una bomba esta `No operativa`, el modal exige cargar un motivo.
- Los manifolds nuevos se agregan al banco central y ajustan la capacidad visual del layout.
