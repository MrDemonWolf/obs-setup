import { AbsoluteFill } from "remotion";
import { SimpleBg } from "./SimpleBg";
import { FrameBar } from "./FrameBar";
import { Frame } from "./Frame";
import type { FrameSceneProps } from "./StreamFrame";

// Co-Working: simple outline overlay. Light background + labelled outline zones
// for webcam / focus timer / tasks / chat. Stack your OBS sources on top.
export const CoworkFrame: React.FC<FrameSceneProps> = ({ title, guides }) => (
  <AbsoluteFill>
    <SimpleBg />
    <FrameBar x={56} y={40} w={1808} title={title} />
    <Frame x={56} y={156} w={900} h={620} label="WEBCAM" guides={guides} live />
    <Frame x={992} y={156} w={872} h={230} label="FOCUS TIMER" guides={guides} />
    <Frame x={992} y={412} w={420} h={508} label="TASKS" guides={guides} />
    <Frame x={1444} y={412} w={420} h={508} label="CHAT" guides={guides} />
  </AbsoluteFill>
);
