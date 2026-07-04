import { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Player, PlayerRef } from "@remotion/player";
import { SCENES } from "../src/scenes";
import { VIDEO } from "../src/theme";

export const ObsPreview: React.FC = () => {
  const [sceneId, setSceneId] = useState(SCENES[0].id);
  const scene = useMemo(() => SCENES.find((s) => s.id === sceneId)!, [sceneId]);
  const playerRef = useRef<PlayerRef>(null);

  // @remotion/player gates `autoPlay` until a user gesture, so a fresh page
  // load sits paused. Try play() on mount + scene change (works in browsers
  // that allow silent autoplay)…
  useEffect(() => {
    const kick = setInterval(() => {
      const p = playerRef.current;
      if (p && !p.isPlaying()) p.play();
    }, 150);
    const stop = setTimeout(() => clearInterval(kick), 1500);
    return () => {
      clearInterval(kick);
      clearTimeout(stop);
    };
  }, [sceneId]);

  // …and for browsers that hard-gate autoplay, start on the very first user
  // interaction ANYWHERE on the page (pointer/key/scroll), so it's animating
  // the instant you touch it — no need to hunt for a button to click.
  useEffect(() => {
    const start = () => playerRef.current?.play();
    const evs = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, start));
  }, []);

  // Preview EVERY scene on a fixed 1920×1080 stage so the box never changes
  // size. Off-size scenes (e.g. the 760×180 Socials badge) render at native
  // size, centred — instead of the Player blowing them up to fill the frame.
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

  return (
    <div className="app">
      <div className="window">
        <div className="titlebar">
          <span className="dots">
            <i style={{ background: "#E0533D" }} />
            <i style={{ background: "#E6B34B" }} />
            <i style={{ background: "#3ED598" }} />
          </span>
          <span className="wintitle">MrDemonWolf · Stream Overlays</span>
        </div>
        <div className="stage">
          <Player
            key={sceneId}
            ref={playerRef}
            component={StageComp}
            durationInFrames={scene.durationInFrames ?? VIDEO.durationInFrames}
            fps={VIDEO.fps}
            compositionWidth={VIDEO.width}
            compositionHeight={VIDEO.height}
            style={{ width: "100%", height: "100%" }}
            loop
            autoPlay
            initiallyMuted
            controls={false}
            clickToPlay={false}
          />
        </div>
      </div>

      <div className="switch">
        {SCENES.map((s) => (
          <button
            key={s.id}
            className={s.id === sceneId ? "scene-btn active" : "scene-btn"}
            onClick={() => setSceneId(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="hint">
        <code>npx remotion render {sceneId} out/{sceneId}.mp4</code>
      </div>
    </div>
  );
};
