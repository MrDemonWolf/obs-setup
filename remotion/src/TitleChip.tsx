import { theme } from "./theme";
import { display, body } from "./fonts";

// Forest Lounge: open typography, with room below for independent OBS widgets.
export const TitleChip: React.FC<{ title: string; status: string }> = ({ title, status }) => (
  <div style={{ position: "absolute", left: 96, top: 330, width: 1000 }}>
    <div style={{
      fontFamily: display, fontWeight: 800, fontSize: 100,
      lineHeight: 1.12, color: theme.white, letterSpacing: -2,
      maxWidth: 980, textWrap: "balance",
      textShadow: "0 4px 24px rgba(0,0,0,0.65)",
    }}>{title}</div>
    <div style={{
      marginTop: 28, maxWidth: 900, fontFamily: body, fontSize: 34,
      lineHeight: 1.5, color: "rgba(228,244,252,0.94)",
      textShadow: "0 2px 12px rgba(0,0,0,0.8)",
    }}>{status}</div>
  </div>
);
