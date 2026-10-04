import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { TitleChip } from "./TitleChip";
import { Mascot } from "./Mascot";
import { FursonaCameo } from "./FursonaCameo";
import { ChatBoxFrame } from "./ChatBoxFrame";
import { theme } from "./theme";

export type SceneProps = {
  title: string;
  subtitle: string; // rendered as the status line (body font)
  showMascot: boolean;
  showTitle?: boolean;
  showBackground?: boolean;
  showChatBox?: boolean;
  mascotSrc?: string;
};

export const Scene: React.FC<SceneProps> = ({
  title,
  subtitle,
  showMascot,
  showTitle = true,
  showBackground = true,
  showChatBox = false,
  mascotSrc,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.navyDeep }}>
    {showBackground && <Background variant="forest" moon={{ x: 1568 }} />}
    <AbsoluteFill style={{
      background: "linear-gradient(90deg, rgba(3,12,24,0.62) 0%, rgba(3,12,24,0.34) 45%, transparent 66%)",
      pointerEvents: "none",
    }} />
    {showChatBox && <ChatBoxFrame />}
    {showTitle && <TitleChip title={title} status={subtitle} />}
    {showTitle && <FursonaCameo src={mascotSrc} />}
    {showMascot && <Mascot src={mascotSrc} />}
  </AbsoluteFill>
);
