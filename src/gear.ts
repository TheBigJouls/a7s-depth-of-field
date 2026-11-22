// Base boîtiers + objectifs, spécialisée Sony A7S II / A7S III.
// Les clés de capteur doivent correspondre à CIRCLES_OF_CONFUSION dans App.tsx.

export type Camera = {
  id: string;
  brand: "Sony";
  fixedLens?: boolean;
  model: string;
  sensor: string;
  sensorModes: string[]; // modes de recadrage disponibles sur ce boîtier
  mounts: string[]; // groupes d'objectifs compatibles, dans l'ordre d'affichage
  isoMin: number;
  isoMax: number;
};

export type Lens = {
  id: string;
  maker: string;
  name: string;
  minFocal: number;
  maxFocal: number;
  apertureWide: number; // ouverture max à la focale mini
  apertureTele: number; // ouverture max à la focale maxi
  sensor?: string; // impose un mode capteur (objectifs APS-C → Super 35)
  fixedAperture?: boolean;
};

export const FF = "35mm (full frame)";
export const S35 = "Super 35 / APS-C";
export const FF_CROP_11 = "4K 120p (crop ×1.1)";

export const BRANDS = ["Sony"] as const;

export const CAMERAS: Camera[] = [
  {
    id: "sony-a7sii",
    brand: "Sony",
    model: "Alpha 7S II",
    sensor: FF,
    sensorModes: [FF, S35],
    mounts: ["E", "EF", "E-APSC"],
    isoMin: 100,
    isoMax: 409600,
  },
  {
    id: "sony-a7siii",
    brand: "Sony",
    model: "Alpha 7S III",
    sensor: FF,
    sensorModes: [FF, FF_CROP_11, S35],
    mounts: ["E", "EF", "E-APSC"],
    isoMin: 80,
    isoMax: 409600,
  },
];

export const DEFAULT_CAMERA_ID = "sony-a7siii";
export const DEFAULT_LENS_ID = "E:Sony:FE 24-105mm F4 G OSS";

// [fabricant, nom, focale mini, focale maxi, ouverture grand-angle, ouverture télé]
type Row = [string, string, number, number, number, number?];

const RAW: Record<string, Row[]> = {
  // Monture E plein format (natifs)
  E: [
    // — Les 24-105 et transstandards —
    ["Sony", "FE 24-105mm F4 G OSS", 24, 105, 4],
    ["Sony", "FE PZ 28-135mm F4 G OSS", 28, 135, 4],
    ["Sony", "FE 24-70mm F2.8 GM II", 24, 70, 2.8],
    ["Sony", "FE 24-70mm F2.8 GM", 24, 70, 2.8],
    ["Sony", "Vario-Tessar T* FE 24-70mm F4 ZA OSS", 24, 70, 4],
    ["Sony", "FE 24-50mm F2.8 G", 24, 50, 2.8],
    ["Sony", "FE 20-70mm F4 G", 20, 70, 4],
    ["Sony", "FE 28-70mm F3.5-5.6 OSS (kit)", 28, 70, 3.5, 5.6],
    ["Sony", "FE 24-240mm F3.5-6.3 OSS", 24, 240, 3.5, 6.3],
    // — Grands-angles —
    ["Sony", "FE 12-24mm F4 G", 12, 24, 4],
    ["Sony", "FE 16-35mm F2.8 GM II", 16, 35, 2.8],
    ["Sony", "Vario-Tessar T* FE 16-35mm F4 ZA OSS", 16, 35, 4],
    ["Sony", "FE PZ 16-35mm F4 G", 16, 35, 4],
    ["Sony", "FE 16-25mm F2.8 G", 16, 25, 2.8],
    // — Téléobjectifs —
    ["Sony", "FE 70-200mm F2.8 GM OSS II", 70, 200, 2.8],
    ["Sony", "FE 70-200mm F4 Macro G OSS II", 70, 200, 4],
    ["Sony", "FE 70-300mm F4.5-5.6 G OSS", 70, 300, 4.5, 5.6],
    ["Sony", "FE 100-400mm F4.5-5.6 GM OSS", 100, 400, 4.5, 5.6],
    ["Sony", "FE 200-600mm F5.6-6.3 G OSS", 200, 600, 5.6, 6.3],
    // — Focales fixes —
    ["Sony", "FE 14mm F1.8 GM", 14, 14, 1.8],
    ["Sony", "FE 20mm F1.8 G", 20, 20, 1.8],
    ["Sony", "FE 24mm F1.4 GM", 24, 24, 1.4],
    ["Sony", "FE 24mm F2.8 G", 24, 24, 2.8],
    ["Sony", "FE 28mm F2", 28, 28, 2],
    ["Sony", "FE 35mm F1.4 GM", 35, 35, 1.4],
    ["Sony", "FE 35mm F1.8", 35, 35, 1.8],
    ["Sony", "Sonnar T* FE 35mm F2.8 ZA", 35, 35, 2.8],
    ["Sony", "FE 40mm F2.5 G", 40, 40, 2.5],
    ["Sony", "FE 50mm F1.2 GM", 50, 50, 1.2],
    ["Sony", "FE 50mm F1.4 GM", 50, 50, 1.4],
    ["Sony", "FE 50mm F1.8", 50, 50, 1.8],
    ["Sony", "Sonnar T* FE 55mm F1.8 ZA", 55, 55, 1.8],
    ["Sony", "FE 85mm F1.4 GM II", 85, 85, 1.4],
    ["Sony", "FE 85mm F1.8", 85, 85, 1.8],
    ["Sony", "FE 90mm F2.8 Macro G OSS", 90, 90, 2.8],
    ["Sony", "FE 135mm F1.8 GM", 135, 135, 1.8],
    // — Sigma DG DN —
    ["Sigma", "24-70mm F2.8 DG DN II Art", 24, 70, 2.8],
    ["Sigma", "28-70mm F2.8 DG DN Contemporary", 28, 70, 2.8],
    ["Sigma", "28-45mm F1.8 DG DN Art", 28, 45, 1.8],
    ["Sigma", "16-28mm F2.8 DG DN Contemporary", 16, 28, 2.8],
    ["Sigma", "14-24mm F2.8 DG DN Art", 14, 24, 2.8],
    ["Sigma", "70-200mm F2.8 DG DN OS Sports", 70, 200, 2.8],
    ["Sigma", "100-400mm F5-6.3 DG DN OS Contemporary", 100, 400, 5, 6.3],
    ["Sigma", "24mm F2 DG DN Contemporary", 24, 24, 2],
    ["Sigma", "35mm F1.4 DG DN Art", 35, 35, 1.4],
    ["Sigma", "35mm F2 DG DN Contemporary", 35, 35, 2],
    ["Sigma", "50mm F1.2 DG DN Art", 50, 50, 1.2],
    ["Sigma", "85mm F1.4 DG DN Art", 85, 85, 1.4],
    // — Tamron —
    ["Tamron", "28-75mm F/2.8 Di III VXD G2", 28, 75, 2.8],
    ["Tamron", "28-75mm F/2.8 Di III RXD", 28, 75, 2.8],
    ["Tamron", "20-40mm F/2.8 Di III VXD", 20, 40, 2.8],
    ["Tamron", "17-28mm F/2.8 Di III RXD", 17, 28, 2.8],
    ["Tamron", "70-180mm F/2.8 Di III VXD G2", 70, 180, 2.8],
    ["Tamron", "35-150mm F/2-2.8 Di III VXD", 35, 150, 2, 2.8],
    ["Tamron", "28-200mm F/2.8-5.6 Di III RXD", 28, 200, 2.8, 5.6],
    ["Tamron", "50-400mm F/4.5-6.3 Di III VC VXD", 50, 400, 4.5, 6.3],
    // — Samyang / Zeiss —
    ["Samyang", "AF 24mm F1.8 FE", 24, 24, 1.8],
    ["Samyang", "AF 35mm F1.8 FE", 35, 35, 1.8],
    ["Samyang", "AF 45mm F1.8 FE", 45, 45, 1.8],
    ["Samyang", "AF 75mm F1.8 FE", 75, 75, 1.8],
    ["Samyang", "AF 85mm F1.4 FE II", 85, 85, 1.4],
    ["Zeiss", "Batis 25mm f/2", 25, 25, 2],
    ["Zeiss", "Batis 40mm f/2 CF", 40, 40, 2],
    ["Zeiss", "Batis 85mm f/1.8", 85, 85, 1.8],
  ],
  // Objectifs reflex adaptés (Sigma MC-11 / Metabones) – très courants sur A7S II
  EF: [
    ["Canon EF (adapté)", "EF 24-105mm f/4L IS USM", 24, 105, 4],
    ["Canon EF (adapté)", "EF 24-105mm f/4L IS II USM", 24, 105, 4],
    ["Canon EF (adapté)", "EF 24-105mm f/3.5-5.6 IS STM", 24, 105, 3.5, 5.6],
    ["Canon EF (adapté)", "EF 24-70mm f/2.8L II USM", 24, 70, 2.8],
    ["Canon EF (adapté)", "EF 16-35mm f/4L IS USM", 16, 35, 4],
    ["Canon EF (adapté)", "EF 70-200mm f/2.8L IS II USM", 70, 200, 2.8],
    ["Canon EF (adapté)", "EF 50mm f/1.8 STM", 50, 50, 1.8],
    ["Canon EF (adapté)", "EF 85mm f/1.8 USM", 85, 85, 1.8],
    ["Sigma EF (adapté)", "24-105mm F4 DG OS HSM Art", 24, 105, 4],
    ["Sigma EF (adapté)", "24-70mm F2.8 DG OS HSM Art", 24, 70, 2.8],
    ["Sigma EF (adapté)", "35mm F1.4 DG HSM Art", 35, 35, 1.4],
    ["Sigma EF (adapté)", "50mm F1.4 DG HSM Art", 50, 50, 1.4],
  ],
  // Objectifs APS-C → le boîtier bascule automatiquement en Super 35
  "E-APSC": [
    ["Sony APS-C", "E PZ 18-105mm F4 G OSS", 18, 105, 4],
    ["Sony APS-C", "E 16-55mm F2.8 G", 16, 55, 2.8],
    ["Sony APS-C", "E 18-135mm F3.5-5.6 OSS", 18, 135, 3.5, 5.6],
    ["Sony APS-C", "E 10-18mm F4 OSS", 10, 18, 4],
    ["Sigma APS-C", "18-50mm F2.8 DC DN Contemporary", 18, 50, 2.8],
    ["Sigma APS-C", "18-35mm F1.8 DC HSM Art (EF adapté)", 18, 35, 1.8],
    ["Sigma APS-C", "16mm F1.4 DC DN Contemporary", 16, 16, 1.4],
    ["Sigma APS-C", "30mm F1.4 DC DN Contemporary", 30, 30, 1.4],
    ["Sigma APS-C", "56mm F1.4 DC DN Contemporary", 56, 56, 1.4],
    ["Tamron APS-C", "17-70mm F/2.8 Di III-A VC RXD", 17, 70, 2.8],
  ],
};

export const LENSES_BY_MOUNT: Record<string, Lens[]> = Object.fromEntries(
  Object.entries(RAW).map(([mount, rows]) => [
    mount,
    rows.map(([maker, name, minFocal, maxFocal, wide, tele]) => ({
      id: `${mount}:${maker}:${name}`,
      maker,
      name,
      minFocal,
      maxFocal,
      apertureWide: wide,
      apertureTele: tele ?? wide,
      sensor: mount === "E-APSC" ? S35 : undefined,
    })),
  ])
);

export function lensesForCamera(cam: Camera | undefined): Lens[] {
  if (!cam) return [];
  return cam.mounts.flatMap((m) => LENSES_BY_MOUNT[m] ?? []);
}

/** Ouverture max à une focale donnée (interpolation linéaire entre les extrémités). */
export function maxApertureAt(lens: Lens, focal: number) {
  if (lens.maxFocal === lens.minFocal) return lens.apertureWide;
  const t = (focal - lens.minFocal) / (lens.maxFocal - lens.minFocal);
  const v = lens.apertureWide + (lens.apertureTele - lens.apertureWide) * Math.min(Math.max(t, 0), 1);
  return Math.round(v * 10) / 10;
}

// ── Profils Log (ISO mini typiques)
export type LogProfile = { id: string; name: string; minIso: number; note?: string };

export function logProfilesFor(cam: Camera | undefined): LogProfile[] {
  const lp = (name: string, minIso: number, note?: string): LogProfile => ({ id: name, name, minIso, note });
  if (!cam) return [lp("S-Log3", 800)];
  if (cam.id === "sony-a7sii")
    // A7S II : S-Log2 / S-Log3 en 8 bits, ISO de base 1600 en Log
    return [lp("S-Log2", 1600), lp("S-Log3", 1600)];
  // A7S III : double ISO natif 640 / 12800 en S-Log3
  return [lp("S-Log3", 640, "12800"), lp("S-Log2", 640, "12800")];
}
