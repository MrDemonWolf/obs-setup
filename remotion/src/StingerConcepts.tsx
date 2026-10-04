import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { body, display } from "./fonts";
import { Paw } from "./Paw";
import { theme } from "./theme";

export const STINGER_CONCEPTS = [
  { id: "pawglass", name: "Pawglass Trail", note: "A clean glass sweep with a sparse paw trail." },
  { id: "aurora", name: "Aurora Curtain", note: "A soft northern-light ribbon leads the cover." },
  { id: "frost", name: "Frosted Glass Bloom", note: "Icy light spreads across a dark glass pane." },
  { id: "eclipse", name: "Moon Eclipse", note: "A broad moonlit arc carries the scene change." },
  { id: "snow", name: "Snow Veil", note: "Windblown snow gathers into a calm night cover." },
] as const;

export type StingerConceptId = (typeof STINGER_CONCEPTS)[number]["id"];

const PAW_STEPS = [
  { x: 27, y: 59, rotate: 74 },
  { x: 40, y: 45, rotate: 106 },
  { x: 54, y: 57, rotate: 76 },
  { x: 67, y: 43, rotate: 104 },
  { x: 81, y: 55, rotate: 77 },
];

const PawTrail: React.FC<{ size?: number; opacity?: number }> = ({ size = 132, opacity = 0.74 }) => (
  <>
    {PAW_STEPS.map((step, index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          left: `${step.x}%`,
          top: `${step.y}%`,
          transform: `translate(-50%, -50%) rotate(${step.rotate}deg)`,
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))",
        }}
      >
        <Paw size={size} color={theme.pawWhite} opacity={opacity} />
      </div>
    ))}
  </>
);

const CoverBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: theme.navyDeep }}>
    <Img
      src={staticFile("forest-night-base.png")}
      alt=""
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill style={{ background: "linear-gradient(155deg, rgba(4, 13, 35, 0.52), rgba(5, 15, 32, 0.72))" }} />
    {children}
  </AbsoluteFill>
);

const ConceptArt: React.FC<{ concept: StingerConceptId }> = ({ concept }) => {
  const { width, height } = useVideoConfig();
  const scale = width / 1920;

  if (concept === "pawglass") {
    return (
      <CoverBase>
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 65% 45%, rgba(41, 89, 142, 0.22), transparent 60%), linear-gradient(120deg, rgba(255,255,255,0.07), transparent 38%, rgba(0,172,237,0.05) 75%, transparent)` ,
          }}
        />
        <div style={{ position: "absolute", left: "72%", top: 0, width: 8 * scale, height, background: "rgba(255,255,255,0.92)", boxShadow: `0 0 ${36 * scale}px rgba(0,172,237,0.9)` }} />
        <div style={{ position: "absolute", left: "71.5%", top: 0, width: 3 * scale, height, background: "#00ACED" }} />
        <PawTrail size={126 * scale} opacity={0.75} />
      </CoverBase>
    );
  }

  if (concept === "aurora") {
    return (
      <CoverBase>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 55% 42%, rgba(7, 96, 128, 0.42), transparent 57%), linear-gradient(180deg, rgba(6,19,44,0.22), rgba(3,10,24,0.32))" }} />
        <div style={{ position: "absolute", left: "-8%", top: "9%", width: "118%", height: "78%", borderRadius: "50%", transform: "rotate(-10deg)", background: "radial-gradient(ellipse at 42% 48%, rgba(44, 202, 199, 0.26), rgba(30, 102, 169, 0.14) 36%, transparent 70%)" }} />
        <div style={{ position: "absolute", left: "-5%", top: "20%", width: "113%", height: "54%", borderRadius: "50%", transform: "rotate(-7deg)", background: "radial-gradient(ellipse at 38% 50%, rgba(145, 226, 224, 0.20), rgba(68, 127, 207, 0.11) 42%, transparent 73%)" }} />
        <PawTrail size={118 * scale} opacity={0.82} />
      </CoverBase>
    );
  }

  if (concept === "frost") {
    return (
      <CoverBase>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(18, 48, 80, 0.4), transparent 66%)" }} />
        <AbsoluteFill style={{ border: `${3 * scale}px solid rgba(209, 241, 255, 0.84)`, boxShadow: `inset 0 0 ${70 * scale}px rgba(108, 205, 245, 0.28), inset 0 0 ${10 * scale}px rgba(255,255,255,0.6), 0 0 ${30 * scale}px rgba(0,172,237,0.55)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(198,235,255,0.19), transparent 17%, transparent 82%, rgba(158,219,249,0.12)), linear-gradient(0deg, rgba(190,230,249,0.12), transparent 24%, transparent 80%, rgba(213,241,255,0.16)" }} />
        <div style={{ position: "absolute", left: "8%", top: "12%", width: "28%", height: "22%", borderTop: `${3 * scale}px solid rgba(223,244,255,0.58)`, borderLeft: `${2 * scale}px solid rgba(223,244,255,0.42)`, transform: "skew(-30deg)" }} />
        <div style={{ position: "absolute", right: "7%", bottom: "10%", width: "26%", height: "23%", borderBottom: `${3 * scale}px solid rgba(223,244,255,0.52)`, borderRight: `${2 * scale}px solid rgba(223,244,255,0.38)`, transform: "skew(-30deg)" }} />
        <PawTrail size={116 * scale} opacity={0.9} />
      </CoverBase>
    );
  }

  if (concept === "eclipse") {
    return (
      <CoverBase>
        <div style={{ position: "absolute", left: 120 * scale, top: -250 * scale, width: 1680 * scale, height: 1680 * scale, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #A9C8E8 0%, #56759C 26%, #1D3558 55%, #09172F 78%)", boxShadow: `0 0 ${60 * scale}px rgba(160,218,255,0.5), inset -${42 * scale}px 0 ${100 * scale}px rgba(1,7,19,0.64)` }} />
        <div style={{ position: "absolute", left: 290 * scale, top: -225 * scale, width: 1640 * scale, height: 1640 * scale, borderRadius: "50%", background: "radial-gradient(circle at 45% 44%, #122747 0%, #09172F 60%, #050D20 100%)", boxShadow: `inset ${8 * scale}px 0 ${28 * scale}px rgba(0,172,237,0.28)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,13,35,0.12), rgba(4,13,35,0.28))" }} />
        <PawTrail size={112 * scale} opacity={0.76} />
      </CoverBase>
    );
  }

  const snow = Array.from({ length: 64 }, (_, i) => ({
    left: `${((i * 73 + 11) % 97) + 1}%`,
    top: `${((i * 47 + 13) % 94) + 2}%`,
    width: ((i * 17) % 72) + 22,
    opacity: 0.38 + ((i * 13) % 5) * 0.11,
    rotate: -13 + ((i * 19) % 27),
  }));
  return (
    <CoverBase>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg, rgba(4, 13, 35, 0.30), rgba(5, 15, 32, 0.58)), radial-gradient(ellipse at 52% 52%, rgba(80, 139, 174, 0.18), transparent 64%)" }} />
      {snow.map((flake, index) => (
        <div key={index} style={{ position: "absolute", left: flake.left, top: flake.top, width: `${flake.width * scale}px`, height: 3 * scale, borderRadius: 99, transform: `rotate(${flake.rotate}deg)`, background: `rgba(219, 241, 255, ${flake.opacity})`, boxShadow: `0 0 ${8 * scale}px rgba(143,214,248,0.45)` }} />
      ))}
      <PawTrail size={108 * scale} opacity={0.7} />
    </CoverBase>
  );
};

export const StingerConceptStill: React.FC<{ concept: StingerConceptId }> = ({ concept }) => <ConceptArt concept={concept} />;

const ConceptTile: React.FC<{ concept: (typeof STINGER_CONCEPTS)[number] }> = ({ concept }) => (
  <div style={{ border: "1px solid rgba(193, 221, 244, 0.20)", borderRadius: 18, background: "linear-gradient(155deg, rgba(25,45,72,0.88), rgba(7,17,37,0.94))", padding: 12, boxSizing: "border-box", overflow: "hidden" }}>
    <div style={{ height: 40, display: "flex", alignItems: "center", padding: "0 10px", fontFamily: display, fontSize: 23, fontWeight: 700, color: "#F4F8FF" }}>{concept.name}</div>
    <div style={{ position: "relative", width: 576, height: 324, overflow: "hidden", borderRadius: 11, border: "1px solid rgba(112, 201, 237, 0.42)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: "scale(0.3)", transformOrigin: "top left" }}>
        <StingerConceptStill concept={concept.id} />
      </div>
    </div>
    <div style={{ height: 46, display: "flex", alignItems: "center", padding: "0 8px", fontFamily: body, fontSize: 16, color: "rgba(225,239,251,0.72)" }}>{concept.note}</div>
  </div>
);

const RecommendationTile: React.FC = () => (
  <div style={{ border: "1px solid rgba(56,198,245,0.34)", borderRadius: 18, background: "radial-gradient(ellipse at 16% 0%, rgba(0,172,237,0.18), transparent 56%), linear-gradient(155deg, rgba(22,45,74,0.94), rgba(7,17,37,0.97))", padding: 26, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Paw size={54} color={theme.pawWhite} opacity={0.9} />
      <div style={{ fontFamily: body, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, color: theme.blueBright }}>RECOMMENDED START</div>
    </div>
    <div style={{ marginTop: 20, fontFamily: display, fontSize: 36, fontWeight: 800, color: "#F4F8FF" }}>Pawglass Trail</div>
    <div style={{ marginTop: 12, maxWidth: 480, fontFamily: body, fontSize: 20, lineHeight: 1.5, color: "rgba(225,239,251,0.76)" }}>It keeps the night-forest glass look and the right-walking white paws, while making the cover edge cleaner and easier to read.</div>
    <div style={{ marginTop: 22, fontFamily: body, fontSize: 15, color: "rgba(225,239,251,0.54)" }}>Each image is a visual direction only. The current 4-second Stinger and WAV stay in sync.</div>
  </div>
);

export const StingerConceptBoard: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #132448, #071226 70%)", padding: "24px 40px 32px", boxSizing: "border-box" }}>
    <div style={{ height: 76, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: display, color: "#F4F8FF", fontSize: 30, fontWeight: 800, letterSpacing: -0.4 }}>Five Stinger directions</div>
        <div style={{ fontFamily: body, color: "rgba(218,234,249,0.7)", fontSize: 16, marginTop: 4 }}>Remotion stills at the covered cut · current 4-second transition and WAV timing stay unchanged</div>
      </div>
      <div style={{ fontFamily: body, color: theme.blueBright, fontSize: 14, fontWeight: 700, letterSpacing: 1.2, paddingTop: 10 }}>NIGHT FOREST · WHITE PAWS · GLASS</div>
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 108, bottom: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: 18 }}>
      {STINGER_CONCEPTS.map((concept) => <ConceptTile key={concept.id} concept={concept} />)}
      <RecommendationTile />
    </div>
  </AbsoluteFill>
);
