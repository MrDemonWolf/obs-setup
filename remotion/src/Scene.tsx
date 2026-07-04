import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { TitleChip } from "./TitleChip";
import { Mascot } from "./Mascot";
import { PawTrail } from "./wolf";
import { theme, BgVariant } from "./theme";

export type SceneMood = "hero" | "calm" | "ember";

export type SceneProps = {
  title: string;
  subtitle: string; // rendered as the mono status line
  showMascot: boolean;
  showTitle?: boolean;
  showBackground?: boolean;
  mascotSrc?: string;
  mood?: SceneMood;
  loader?: boolean; // paw-pulse loading indicator in the status line
};

const variantFor = (mood: SceneMood): BgVariant => (mood === "ember" ? "ember" : "night");

export const Scene: React.FC<SceneProps> = ({
  title,
  subtitle,
  showMascot,
  showTitle = true,
  showBackground = true,
  mascotSrc,
  mood = "calm",
  loader = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    {showBackground && <Background variant={variantFor(mood)} />}
    <PawTrail />
    {showTitle && <TitleChip title={title} status={subtitle} loader={loader} />}
    {showMascot && <Mascot src={mascotSrc} />}
  </AbsoluteFill>
);
