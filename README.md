# Frac Layout HMI

Aplicacion web tactil construida con `React + TypeScript + Vite + Tailwind CSS` para representar un frac spread con manifolds centrales, bombas a izquierda y derecha, y una zona de bombas disponibles o fuera del set.

La app esta pensada para operacion local en Windows, en pantalla grande tactil de aproximadamente 32 pulgadas, sin backend y con persistencia en `localStorage`.

## Autoria

Desarrollado por Lucas Vuletin.

La atribucion identifica al creador y desarrollador de esta version de la aplicacion en la interfaz, los metadatos del sitio y los archivos Excel exportados.

## Funcionalidades incluidas

- Header operativo con `OCTIV` y selector de `SET` del 1 al 6.
- Botonera tactil para `Agregar bomba`, `Agregar manifold`, `Pantalla completa`, `Guardar layout` y `Limpiar layout`.
- Layout principal con manifolds centrales y bombas distribuidas a izquierda, derecha y bench.
- Drag & drop compatible con mouse y touch usando `dnd-kit`.
- Alta manual de bombas con validacion de `SAP`, estado, motivo libre y datos `DGB`.
- Alta manual y edicion en layout de manifolds con nombre `Limpio/Sucio` y cantidad de slots por lado.
- Edicion manual de cada bomba mediante modal grande, incluida la opcion de borrarla.
- Tarjetas de bomba simplificadas: estado, motivo si corresponde, `SAP`, `DGB`, porcentaje de sustitucion y comentario `Error:` si aplica.
- Lineas visuales sobrias hacia el manifold: celeste, marron o sin linea.
- Contadores operativos en/fuera del set, resumen de bombas con/sin DGB y promedio de sustitucion de bombas DGB activas con porcentaje mayor a cero.
- Cada bomba permite elegir en su editor si muestra `P/D/S` en 3 o 5 columnas.
- Guardado automatico en el navegador con `localStorage` para bombas, manifolds y set seleccionado.
- Vista movil con el mismo esquema izquierda / manifold / derecha del escritorio.
- Firma de autoria visible en la aplicacion y en cada exportacion Excel.

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
- Se persisten bombas, sus datos `DGB` y columnas `P/D/S`, manifolds y el `SET` seleccionado.
- El boton `Guardar layout` confirma que la configuracion actual queda almacenada en el equipo.
- El boton `Limpiar layout` solicita confirmacion y elimina las bombas conservando los manifolds.
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
- Si una bomba esta `No operativa`, el modal exige escribir o seleccionar un motivo.
- Las bombas `DGB` permiten cargar un porcentaje de sustitucion de 0 a 100.
- Si una bomba `DGB` no sustituye, su editor permite registrar un comentario visible bajo `Error:`.
- El contador `Bombas sin sustituir` considera bombas `DGB` operativas del set con `0%` y comentario `Error:` cargado.
- La ubicacion de una bomba se determina arrastrandola a un slot; no se edita manualmente como campo.
- Desde `Editar` en cada manifold se puede cambiar `Limpio/Sucio` y la cantidad de slots, siempre que no se oculten bombas ubicadas.
- Los manifolds nuevos se agregan al banco central y ajustan la capacidad visual del layout.
