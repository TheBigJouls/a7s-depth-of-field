// Personnage illustré (vue de face) pour l'aperçu écran.
// Unités : pouces, comme les silhouettes de PhotographyGraphic (hauteur ≈ 72).
// Sommet du crâne vers y = 0, pieds vers y = 72, centré sur x = 0.

const SKIN = "#e2b08c";
const SKIN_SHADE = "#c98f6c";
const HAIR = "#3b2a20";
const SWEATER = "#b4553f";
const SWEATER_SHADE = "#923f2e";
const JEANS = "#3e5170";
const JEANS_SHADE = "#2f3f59";
const SHOES = "#2a2422";

export const PersonIllustration = () => (
  <g>
    <defs>
      <radialGradient id="pi-face" cx="0.42" cy="0.4" r="0.7">
        <stop offset="0.55" stopColor={SKIN} />
        <stop offset="1" stopColor={SKIN_SHADE} />
      </radialGradient>
      <linearGradient id="pi-torso" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={SWEATER_SHADE} />
        <stop offset="0.25" stopColor={SWEATER} />
        <stop offset="0.75" stopColor={SWEATER} />
        <stop offset="1" stopColor={SWEATER_SHADE} />
      </linearGradient>
    </defs>

    {/* Chaussures */}
    <ellipse cx={-3.6} cy={71} rx={2.9} ry={1.2} fill={SHOES} />
    <ellipse cx={3.6} cy={71} rx={2.9} ry={1.2} fill={SHOES} />

    {/* Jean */}
    <path
      d="M-7 32 L7 32 L6.3 70 L1.1 70 L0.4 41 L-0.4 41 L-1.1 70 L-6.3 70 Z"
      fill={JEANS}
    />
    <path d="M0.4 41 L1.1 70 L2.2 70 L1.4 42 Z" fill={JEANS_SHADE} />
    <path d="M-0.4 41 L-1.1 70 L-2.2 70 L-1.4 42 Z" fill={JEANS_SHADE} />
    <rect x={-7} y={32} width={14} height={1.1} fill="#2a2522" />

    {/* Bras (manches) */}
    <path d="M-8.4 12.8 Q-10.9 13.6 -10.9 18 L-11.1 31 L-8.5 31 L-8.1 18 Z" fill={SWEATER_SHADE} />
    <path d="M8.4 12.8 Q10.9 13.6 10.9 18 L11.1 31 L8.5 31 L8.1 18 Z" fill={SWEATER_SHADE} />
    {/* Mains */}
    <ellipse cx={-9.8} cy={33} rx={1.35} ry={2.1} fill={SKIN} />
    <ellipse cx={9.8} cy={33} rx={1.35} ry={2.1} fill={SKIN} />
    <rect x={-11.1} y={30.4} width={2.6} height={0.9} rx={0.4} fill={SWEATER} />
    <rect x={8.5} y={30.4} width={2.6} height={0.9} rx={0.4} fill={SWEATER} />

    {/* Cou */}
    <rect x={-1.6} y={8.4} width={3.2} height={3.8} fill={SKIN_SHADE} />

    {/* Pull */}
    <path
      d="M-8.4 12.8 Q-9.4 13.4 -9.2 16 L-8 33 L8 33 L9.2 16 Q9.4 13.4 8.4 12.8 L3.1 11.1 Q0 12.6 -3.1 11.1 Z"
      fill="url(#pi-torso)"
    />
    {/* Col */}
    <path d="M-3.1 11.1 Q0 13.4 3.1 11.1 Q0 12.2 -3.1 11.1 Z" fill={SWEATER_SHADE} />
    {/* Bas côte du pull */}
    <rect x={-8} y={31.2} width={16} height={1.8} fill={SWEATER_SHADE} opacity={0.7} />

    {/* Oreilles */}
    <ellipse cx={-3.35} cy={5.1} rx={0.55} ry={1} fill={SKIN_SHADE} />
    <ellipse cx={3.35} cy={5.1} rx={0.55} ry={1} fill={SKIN_SHADE} />

    {/* Visage */}
    <path
      d="M-3.3 4 Q-3.3 9.3 0 9.6 Q3.3 9.3 3.3 4 Q3.3 0.4 0 0.4 Q-3.3 0.4 -3.3 4 Z"
      fill="url(#pi-face)"
    />

    {/* Cheveux */}
    <path
      d="M-3.65 4.6 Q-4.1 -0.7 0 -0.5 Q4.1 -0.7 3.65 4.6 Q3.3 2.3 2.1 1.9 Q0.2 2.7 -2.2 1.7 Q-3.2 2.3 -3.65 4.6 Z"
      fill={HAIR}
    />

    {/* Sourcils */}
    <path d="M-2.3 3.45 Q-1.5 3.0 -0.65 3.3" stroke={HAIR} strokeWidth={0.32} fill="none" strokeLinecap="round" />
    <path d="M2.3 3.45 Q1.5 3.0 0.65 3.3" stroke={HAIR} strokeWidth={0.32} fill="none" strokeLinecap="round" />

    {/* Yeux */}
    <ellipse cx={-1.4} cy={4.35} rx={0.62} ry={0.32} fill="#f6f1ea" />
    <ellipse cx={1.4} cy={4.35} rx={0.62} ry={0.32} fill="#f6f1ea" />
    <circle cx={-1.38} cy={4.35} r={0.27} fill="#5a3b26" />
    <circle cx={1.38} cy={4.35} r={0.27} fill="#5a3b26" />
    <circle cx={-1.38} cy={4.35} r={0.12} fill="#16100c" />
    <circle cx={1.38} cy={4.35} r={0.12} fill="#16100c" />
    <circle cx={-1.3} cy={4.27} r={0.05} fill="#fff" />
    <circle cx={1.46} cy={4.27} r={0.05} fill="#fff" />

    {/* Nez */}
    <path
      d="M0.05 4.7 Q-0.2 5.9 -0.45 6.35 Q-0.05 6.7 0.45 6.45"
      stroke={SKIN_SHADE}
      strokeWidth={0.22}
      fill="none"
      strokeLinecap="round"
    />

    {/* Bouche */}
    <path d="M-1.05 7.55 Q0 7.25 1.05 7.55 Q0 8.35 -1.05 7.55 Z" fill="#b0645a" />
    <path d="M-1.05 7.55 Q0 7.75 1.05 7.55" stroke="#8a4a42" strokeWidth={0.12} fill="none" />

    {/* Joues */}
    <ellipse cx={-2.1} cy={6.4} rx={0.75} ry={0.45} fill="#d98b78" opacity={0.35} />
    <ellipse cx={2.1} cy={6.4} rx={0.75} ry={0.45} fill="#d98b78" opacity={0.35} />
  </g>
);
