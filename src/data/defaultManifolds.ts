import { Manifold } from "../models";

export const DEFAULT_DIRTY_MANIFOLD_ID = "manifold-dirty-1";
export const DEFAULT_CLEAN_MANIFOLD_ID = "manifold-clean-1";

const DEFAULT_MANIFOLDS: Manifold[] = [
  {
    id: DEFAULT_DIRTY_MANIFOLD_ID,
    label: "MFD-01",
    type: "dirty",
    pumpsPerSide: 8,
  },
  {
    id: DEFAULT_CLEAN_MANIFOLD_ID,
    label: "MFC-01",
    type: "clean",
    pumpsPerSide: 8,
  },
];

export function createDefaultManifolds() {
  return DEFAULT_MANIFOLDS.map((manifold) => ({ ...manifold }));
}
