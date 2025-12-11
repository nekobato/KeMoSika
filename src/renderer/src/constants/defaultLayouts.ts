import type { LayoutData } from "@shared/types";
import fpsBaselineLayout, { displayOrder as fpsOrder } from "./layouts/fpsBaseline";
import navigationBasicLayout, { displayOrder as navigationOrder } from "./layouts/navigationBasic";
import macbookAir2022Layout, { displayOrder as macbookOrder } from "./layouts/macbookAir2022";

const layoutsWithOrder: Array<{ layout: LayoutData; order: number }> = [
  { layout: fpsBaselineLayout, order: fpsOrder },
  { layout: navigationBasicLayout, order: navigationOrder },
  { layout: macbookAir2022Layout, order: macbookOrder }
];

export const builtInLayouts: LayoutData[] = layoutsWithOrder
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(({ layout }) => layout);

export default builtInLayouts;
