// Décors d'intérieur pour l'aperçu écran, dessinés à ~4,5 m derrière le sujet.
// Unités : pouces. Le sol est à y = floor, chaque module fait 70 de large
// et commence à x - 35 (mêmes positions que les panneaux de rideau d'origine).
import type { ScenePalette } from "./lighting";

const BOOKS = ["#8c2f2f", "#2f5a8c", "#c9a23a", "#3d6b4a", "#6b3d6b", "#d9d0c0", "#a4572c"];

type Props = { P: ScenePalette; modules: number[]; floor: number; halfW: number };

export function IndoorDecor({ P, modules, floor, halfW }: Props) {
  const decor = P.decor ?? "curtain";
  const F = floor;
  const wallW = halfW * 2 + 160;
  const wallX = -halfW - 80;

  if (decor === "curtain")
    return (
      <>
        {modules.map((x, i) => (
          <rect key={i} x={x - 35} y={F - 300} width={36} height={300} fill={P.trees[i % 3]} />
        ))}
      </>
    );

  if (decor === "living")
    return (
      <>
        <rect x={wallX} y={F - 300} width={wallW} height={300} fill={P.wall} />
        <rect x={wallX} y={F - 4} width={wallW} height={4} fill={P.trees[2]} />
        {modules.map((x, i) => {
          const x0 = x - 35;
          if (i % 3 === 0)
            return (
              <g key={i}>
                <rect x={x0 + 4} y={F - 84} width={62} height={84} fill={P.trees[0]} />
                {[0, 1, 2, 3].map((r) => (
                  <g key={r}>
                    <rect x={x0 + 7} y={F - 81 + r * 20} width={56} height={17} fill="#3a2a1e" />
                    {Array.from({ length: 14 }).map((_, k) => {
                      const h = 11 + ((i + r * 3 + k * 7) % 5);
                      return (
                        <rect
                          key={k}
                          x={x0 + 8 + k * 3.9}
                          y={F - 64 + r * 20 - h}
                          width={3.4}
                          height={h}
                          fill={BOOKS[(i + r + k * 3) % BOOKS.length]}
                        />
                      );
                    })}
                  </g>
                ))}
              </g>
            );
          if (i % 3 === 1)
            return (
              <g key={i}>
                <rect x={x0 + 14} y={F - 76} width={42} height={30} fill={P.trees[2]} />
                <rect x={x0 + 17} y={F - 73} width={36} height={24} fill="#d8c7a0" />
                <path d={`M${x0 + 17} ${F - 55} L${x0 + 30} ${F - 66} L${x0 + 40} ${F - 58} L${x0 + 53} ${F - 68} L${x0 + 53} ${F - 49} L${x0 + 17} ${F - 49} Z`} fill="#7d8f6a" />
                <rect x={x0 + 4} y={F - 30} width={62} height={26} fill={P.trees[1]} />
                <rect x={x0 + 4} y={F - 30} width={62} height={3} fill={P.trees[2]} />
              </g>
            );
          return (
            <g key={i}>
              <path d={`M${x0 + 27} ${F} L${x0 + 25} ${F - 16} L${x0 + 45} ${F - 16} L${x0 + 43} ${F} Z`} fill="#8a5a3c" />
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <ellipse
                  key={k}
                  cx={x0 + 35 + (k - 2.5) * 5}
                  cy={F - 26 - (k % 3) * 9}
                  rx={6}
                  ry={11}
                  transform={`rotate(${(k - 2.5) * 14} ${x0 + 35 + (k - 2.5) * 5} ${F - 26 - (k % 3) * 9})`}
                  fill={P.leaves[k % 2]}
                />
              ))}
            </g>
          );
        })}
      </>
    );

  if (decor === "office")
    return (
      <>
        <rect x={wallX} y={F - 300} width={wallW} height={300} fill={P.skyBottom} />
        <rect x={wallX} y={F - 3} width={wallW} height={3} fill={P.wall} />
        {modules.map((x, i) => {
          const x0 = x - 35;
          return (
            <g key={i}>
              {/* Dalle lumineuse au plafond */}
              <rect x={x0 + 15} y={F - 112} width={40} height={3} fill="#ffffff" />
              {i % 2 === 0 ? (
                <g>
                  <rect x={x0 + 5} y={F - 92} width={60} height={62} fill={P.wall} />
                  <rect x={x0 + 8} y={F - 89} width={54} height={56} fill={P.trees[0]} />
                  {Array.from({ length: 18 }).map((_, k) => (
                    <line key={k} x1={x0 + 8} x2={x0 + 62} y1={F - 87 + k * 3.1} y2={F - 87 + k * 3.1} stroke={P.trees[1]} strokeWidth={1.1} />
                  ))}
                </g>
              ) : (
                <g>
                  <rect x={x0 + 10} y={F - 74} width={50} height={32} fill="#f6f7f6" stroke={P.wall} strokeWidth={1.5} />
                  <path d={`M${x0 + 15} ${F - 66} q6 -4 12 0 t12 0`} stroke="#2f5a8c" strokeWidth={1} fill="none" />
                  <path d={`M${x0 + 15} ${F - 58} h22`} stroke="#8c2f2f" strokeWidth={1} />
                  <path d={`M${x0 + 15} ${F - 52} h14`} stroke="#3d6b4a" strokeWidth={1} />
                </g>
              )}
              {/* Bureau + écran */}
              <rect x={x0 + 4} y={F - 30} width={62} height={2.5} fill="#b8bcbe" />
              <rect x={x0 + 8} y={F - 28} width={2} height={28} fill="#7c8184" />
              <rect x={x0 + 60} y={F - 28} width={2} height={28} fill="#7c8184" />
              <rect x={x0 + 24} y={F - 44} width={22} height={13} fill="#22262a" />
              <rect x={x0 + 33} y={F - 31} width={4} height={1.5} fill="#22262a" />
              {i % 4 === 3 && (
                <g>
                  <rect x={x0 + 52} y={F - 14} width={10} height={14} fill="#e9ecea" />
                  {[0, 1, 2, 3].map((k) => (
                    <ellipse key={k} cx={x0 + 57 + (k - 1.5) * 3} cy={F - 20 - (k % 2) * 6} rx={3} ry={7} fill={P.leaves[k % 2]} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </>
    );

  if (decor === "studio")
    return (
      <>
        <rect x={wallX} y={F - 300} width={wallW} height={300} fill={P.trees[1]} />
        {modules.map((x, i) => {
          const x0 = x - 35;
          return (
            <g key={i}>
              <rect x={x0} y={F - 300} width={34} height={300} fill={P.trees[i % 3]} />
              {/* Halo de lumière d'ambiance sur le fond */}
              <ellipse cx={x0 + 35} cy={F - 60} rx={34} ry={46} fill={P.wall} opacity={0.15} />
              {i % 4 === 0 && (
                <g>
                  <rect x={x0 + 10} y={F - 48} width={50} height={2.5} fill="#6a5440" />
                  {[0, 1, 2, 3, 4].map((k) => (
                    <rect key={k} x={x0 + 14 + k * 4} y={F - 60 + (k % 2)} width={3.4} height={12 - (k % 2)} fill={BOOKS[(k + i) % BOOKS.length]} opacity={0.8} />
                  ))}
                  <path d={`M${x0 + 42} ${F - 48} L${x0 + 41} ${F - 56} L${x0 + 51} ${F - 56} L${x0 + 50} ${F - 48} Z`} fill="#8a5a3c" />
                  {[0, 1, 2].map((k) => (
                    <ellipse key={k} cx={x0 + 46 + (k - 1) * 3} cy={F - 61} rx={2.5} ry={5} fill={P.leaves[k % 2]} />
                  ))}
                </g>
              )}
              {i % 4 === 2 && (
                <g>
                  <path d={`M${x0 + 28} ${F} L${x0 + 27} ${F - 14} L${x0 + 43} ${F - 14} L${x0 + 42} ${F} Z`} fill="#2a2522" />
                  {[0, 1, 2, 3, 4].map((k) => (
                    <ellipse key={k} cx={x0 + 35 + (k - 2) * 4} cy={F - 24 - (k % 3) * 10} rx={5} ry={12} fill={P.leaves[k % 2]} transform={`rotate(${(k - 2) * 15} ${x0 + 35 + (k - 2) * 4} ${F - 24 - (k % 3) * 10})`} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </>
    );

  if (decor === "window")
    return (
      <>
        <rect x={wallX} y={F - 300} width={wallW} height={300} fill={P.skyBottom} />
        <rect x={wallX} y={F - 4} width={wallW} height={4} fill="#c9bda9" />
        {modules.map((x, i) => {
          const x0 = x - 35;
          if (i % 2 === 0)
            return (
              <g key={i}>
                <rect x={x0 + 3} y={F - 100} width={64} height={72} fill="#f7f5f0" />
                <rect x={x0 + 6} y={F - 97} width={58} height={66} fill="#ffffff" />
                <rect x={x0 + 6} y={F - 97} width={58} height={40} fill={P.trees[0]} />
                {[0, 1, 2].map((k) => (
                  <ellipse key={k} cx={x0 + 14 + k * 21} cy={F - 46} rx={13} ry={11} fill={P.wall} opacity={0.55} />
                ))}
                <rect x={x0 + 34} y={F - 97} width={2} height={66} fill="#f7f5f0" />
                <rect x={x0 + 6} y={F - 66} width={58} height={2} fill="#f7f5f0" />
              </g>
            );
          return (
            <g key={i}>
              <rect x={x0 - 4} y={F - 108} width={16} height={108} fill={P.trees[1]} />
              <rect x={x0 + 58} y={F - 108} width={16} height={108} fill={P.trees[1]} />
              {[0, 5, 10].map((k) => (
                <g key={k}>
                  <line x1={x0 - 2 + k} x2={x0 - 2 + k} y1={F - 108} y2={F} stroke={P.trees[2]} strokeWidth={1.2} />
                  <line x1={x0 + 60 + k} x2={x0 + 60 + k} y1={F - 108} y2={F} stroke={P.trees[2]} strokeWidth={1.2} />
                </g>
              ))}
              <rect x={x0 + 22} y={F - 26} width={26} height={2} fill="#8a6a4c" />
              <rect x={x0 + 34} y={F - 24} width={2} height={24} fill="#8a6a4c" />
              <rect x={x0 + 31} y={F - 34} width={8} height={8} fill="#e9e1d1" />
            </g>
          );
        })}
      </>
    );

  // church
  return (
    <>
      <rect x={wallX} y={F - 300} width={wallW} height={300} fill={P.trees[0]} />
      {Array.from({ length: 22 }).map((_, r) => (
        <line key={r} x1={wallX} x2={wallX + wallW} y1={F - 10 - r * 10} y2={F - 10 - r * 10} stroke={P.trees[1]} strokeWidth={0.8} />
      ))}
      {modules.map((x, i) => {
        const x0 = x - 35;
        if (i % 2 === 0) {
          const cx = x0 + 35;
          const arch = `M${cx - 14} ${F - 48} L${cx - 14} ${F - 100} Q${cx - 14} ${F - 118} ${cx} ${F - 122} Q${cx + 14} ${F - 118} ${cx + 14} ${F - 100} L${cx + 14} ${F - 48} Z`;
          return (
            <g key={i}>
              <defs>
                <clipPath id={`ch-arch-${i}`}>
                  <path d={arch} />
                </clipPath>
              </defs>
              <path d={arch} fill="#3a3229" transform={`translate(0 0) scale(1)`} stroke={P.trees[2]} strokeWidth={3} />
              <g clipPath={`url(#ch-arch-${i})`}>
                {["#4b6ea8", "#b8483f", "#d9b44a", "#3d7a5a", "#4b6ea8"].map((c, k) => (
                  <rect key={k} x={cx - 14 + k * 5.6} y={F - 124} width={5.2} height={78} fill={c} />
                ))}
                {[0, 1, 2, 3].map((k) => (
                  <line key={k} x1={cx - 14} x2={cx + 14} y1={F - 60 - k * 14} y2={F - 60 - k * 14} stroke="#3a3229" strokeWidth={1} />
                ))}
              </g>
            </g>
          );
        }
        return (
          <g key={i}>
            <rect x={x0 + 27} y={F - 300} width={16} height={300} fill={P.trees[2]} />
            <rect x={x0 + 24} y={F - 8} width={22} height={8} fill={P.trees[1]} />
          </g>
        );
      })}
      {/* Bancs */}
      <rect x={wallX} y={F - 17} width={wallW} height={4} fill="#4a3526" />
      <rect x={wallX} y={F - 10} width={wallW} height={3} fill="#3b2a1e" />
    </>
  );
}
