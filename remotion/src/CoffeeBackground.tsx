import { CabinBackground } from "./CabinBackground";
import { DeskForeground } from "./DeskForeground";

/** Complete background for scenes that do not need a model behind the desk. */
export const CoffeeBackground: React.FC = () => (
  <>
    <CabinBackground />
    <DeskForeground />
  </>
);
