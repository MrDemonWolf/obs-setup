import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { TitleChip } from "./TitleChip";
import { Mascot } from "./Mascot";
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
    {showBackground && <Background variant="forest" />}
    {showChatBox && <ChatBoxFrame />}
    {showTitle && <TitleChip title={title} status={subtitle} />}
    {showMascot && <Mascot src={mascotSrc} />}
  </AbsoluteFill>
);
