import "./index.css";
import { Composition } from "remotion";
import { SCENES } from "./scenes";
import { VIDEO } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={s.component}
        durationInFrames={s.durationInFrames ?? VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={s.width ?? VIDEO.width}
        height={s.height ?? VIDEO.height}
        defaultProps={s.props}
      />
    ))}
  </>
);
