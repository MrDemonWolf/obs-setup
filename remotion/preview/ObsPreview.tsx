import { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Player, PlayerRef } from "@remotion/player";
import { SCENES } from "../src/scenes";
import { VIDEO } from "../src/theme";

type PreviewGroup = { title: string; description: string; sceneIds: string[] };

const PREVIEW_GROUPS: PreviewGroup[] = [
  {
    title: "Stream screens",
    description: "The screens viewers see between segments",
    sceneIds: ["StartingSoon", "BRB", "EndingStream"],
  },
  {
    title: "Live layouts",
    description: "Chat and co-working arrangements",
    sceneIds: ["JustChatting", "JustChattingVtuber", "CoworkingSolo", "CoworkingDual"],
  },
  {
    title: "Widgets & transitions",
    description: "Transparent overlays and the scene change",
    sceneIds: ["Background", "Socials", "Countdown", "Countdown10", "LoadingBarks", "Stinger"],
  },
];

const NO_LOOP = new Set(["Countdown", "Countdown10", "Stinger"]);
const ALPHA_SCENES = new Set(["Socials", "Countdown", "Countdown10", "LoadingBarks", "Stinger"]);
type StageBackground = "forest" | "checker" | "midnight";

const formatTime = (frame: number, fps: number) => {
  const seconds = Math.floor(frame / fps);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export const ObsPreview: React.FC = () => {
  const [sceneId, setSceneId] = useState("StartingSoon");
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [stageBackground, setStageBackground] = useState<StageBackground>("forest");
  const scene = useMemo(() => SCENES.find((candidate) => candidate.id === sceneId)!, [sceneId]);
  const playerRef = useRef<PlayerRef>(null);
  const fps = scene.fps ?? VIDEO.fps;
  const duration = scene.durationInFrames ?? VIDEO.durationInFrames;
  const nativeSize = `${scene.width ?? VIDEO.width} × ${scene.height ?? VIDEO.height}`;
  const isAlpha = ALPHA_SCENES.has(scene.id);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (playerRef.current) {
        setFrame(playerRef.current.getCurrentFrame());
        setPlaying(playerRef.current.isPlaying());
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [sceneId]);

  const StageComp = useMemo(() => {
    const Comp = scene.component;
    const offSize = scene.width || scene.height;
    const Preview: React.FC = () =>
      offSize ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: scene.width ?? VIDEO.width,
              height: scene.height ?? VIDEO.height,
            }}
          >
            <Comp {...scene.props} />
          </div>
        </AbsoluteFill>
      ) : (
        <Comp {...scene.props} />
      );
    return Preview;
  }, [scene]);

  const chooseScene = (id: string) => {
    setFrame(0);
    setPlaying(true);
    setSceneId(id);
  };

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  const restart = () => {
    playerRef.current?.seekTo(0);
    playerRef.current?.play();
    setPlaying(true);
  };

  return (
    <main className="app">
      <header className="masthead">
        <div>
          <p className="eyebrow"><span className="eyebrow-paw">✦</span> MRDEMONWOLF · REMOTION PREVIEW</p>
          <h1>Stream scenes</h1>
          <p className="intro">One moonlit forest look across your scenes, with layouts tuned for standby, live, and co-working.</p>
        </div>
        <div className="live-pill"><span /> LIVE PREVIEW</div>
      </header>

      <section className="preview-column" aria-label="Selected scene preview">
        <div className="window">
          <div className="titlebar">
            <span className="dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="wintitle">{scene.label}</span>
            <span className="scene-size">{nativeSize} · {fps} fps</span>
          </div>
          <div className={`stage stage-${stageBackground}`}>
            <Player
              key={sceneId}
              ref={playerRef}
              component={StageComp}
              durationInFrames={duration}
              fps={fps}
              compositionWidth={VIDEO.width}
              compositionHeight={VIDEO.height}
              style={{ width: "100%", height: "100%" }}
              loop={!NO_LOOP.has(scene.id)}
              autoPlay
              initiallyMuted
              controls={false}
              clickToPlay={false}
            />
          </div>
          <div className="transport">
            <button className="transport-button primary" onClick={togglePlayback} aria-label="Play or pause preview">
              {playing ? "Ⅱ" : "▶"}
              <span>{playing ? "Pause" : "Play"}</span>
            </button>
            <button className="transport-button" onClick={restart} aria-label="Restart preview">↺<span>Restart</span></button>
            <div className="timeline">
              <input
                aria-label="Preview timeline"
                type="range"
                min={0}
                max={Math.max(0, duration - 1)}
                value={Math.min(frame, duration - 1)}
                onChange={(event) => {
                  const next = Number(event.currentTarget.value);
                  playerRef.current?.seekTo(next);
                  setFrame(next);
                }}
              />
              <div className="timecodes"><span>{formatTime(frame, fps)}</span><span>{formatTime(duration - 1, fps)}</span></div>
            </div>
          </div>
          <div className="stage-footer">
            <div className="scene-caption">
              <span className="scene-state">{isAlpha ? "TRANSPARENT OVERLAY" : "FULL SCENE"}</span>
              <span>{scene.label}</span>
            </div>
            {isAlpha && (
              <div className="background-picker" aria-label="Preview background">
                <span>Preview on</span>
                {(["forest", "checker", "midnight"] as const).map((background) => (
                  <button
                    key={background}
                    className={stageBackground === background ? "bg-choice active" : "bg-choice"}
                    onClick={() => setStageBackground(background)}
                    aria-pressed={stageBackground === background}
                  >
                    {background === "forest" ? "Forest" : background === "checker" ? "Grid" : "Dark"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="scene-library" aria-label="Choose a scene">
        <div className="library-heading">
          <div>
            <p className="eyebrow">SCENE LIBRARY</p>
            <h2>Choose a view</h2>
          </div>
          <span className="scene-count">{SCENES.length} scenes</span>
        </div>
        <div className="library-groups">
          {PREVIEW_GROUPS.map((group) => {
            const scenes = group.sceneIds
              .map((id) => SCENES.find((candidate) => candidate.id === id))
              .filter((candidate) => candidate !== undefined);
            return (
              <section className="library-group" key={group.title}>
                <div className="library-group-heading">
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="scene-list">
                  {scenes.map((candidate) => (
                    <button
                      key={candidate.id}
                      className={candidate.id === sceneId ? "scene-btn active" : "scene-btn"}
                      aria-pressed={candidate.id === sceneId}
                      onClick={() => chooseScene(candidate.id)}
                    >
                      <span className="scene-mark" aria-hidden="true">◦</span>
                      <span>{candidate.label}</span>
                      {candidate.id === sceneId && <span className="selected-mark" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </aside>
    </main>
  );
};
