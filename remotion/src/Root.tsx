import "./index.css";
import { Composition } from "remotion";
import { SCENES } from "./scenes";
import { VIDEO } from "./theme";
import { StingerConceptBoard, StingerConceptStill, STINGER_CONCEPTS, StingerConceptId } from "./StingerConcepts";
import { LegacyPawSwipeStinger } from "./StingerPawSwipeBackup";
import { STINGER_DURATION, STINGER_FPS } from "./StingerAudio";

const CONCEPT_STILLS: Record<StingerConceptId, React.FC> = {
  pawglass: () => <StingerConceptStill concept="pawglass" />,
  aurora: () => <StingerConceptStill concept="aurora" />,
  frost: () => <StingerConceptStill concept="frost" />,
  eclipse: () => <StingerConceptStill concept="eclipse" />,
  snow: () => <StingerConceptStill concept="snow" />,
};

export const RemotionRoot: React.FC = () => (
  <>
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={s.component}
        durationInFrames={s.durationInFrames ?? VIDEO.durationInFrames}
        fps={s.fps ?? VIDEO.fps}
        width={s.width ?? VIDEO.width}
        height={s.height ?? VIDEO.height}
        defaultProps={s.props}
      />
    ))}
    {STINGER_CONCEPTS.map((concept) => (
      <Composition
        key={concept.id}
        id={`Stinger${concept.id[0].toUpperCase()}${concept.id.slice(1)}`}
        component={CONCEPT_STILLS[concept.id]}
        durationInFrames={1}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    {/* Retained as a renderable rollback option; the OBS preview and release
        continue to use only the moon-only Stinger composition above. */}
    <Composition
      id="LegacyPawSwipeStingerBackup"
      component={LegacyPawSwipeStinger}
      durationInFrames={STINGER_DURATION}
      fps={STINGER_FPS}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="StingerConceptBoard"
      component={StingerConceptBoard}
      durationInFrames={1}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
