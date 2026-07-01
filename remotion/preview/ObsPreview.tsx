import { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { SCENES } from "../src/scenes";
import { VIDEO } from "../src/theme";

export const ObsPreview: React.FC = () => {
  const [sceneId, setSceneId] = useState(SCENES[0].id);
  const scene = useMemo(() => SCENES.find((s) => s.id === sceneId)!, [sceneId]);

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
            component={scene.component}
            inputProps={{ ...scene.props, guides: true }}
            durationInFrames={VIDEO.durationInFrames}
            fps={VIDEO.fps}
            compositionWidth={scene.width ?? VIDEO.width}
            compositionHeight={scene.height ?? VIDEO.height}
            style={{ width: "100%", height: "100%" }}
            loop
            autoPlay
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
