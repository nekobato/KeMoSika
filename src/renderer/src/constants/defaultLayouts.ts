import type { LayoutData } from "@shared/types";
import fpsBaselineLayout, { displayOrder as fpsOrder } from "./layouts/fpsBaseline";
import navigationBasicLayout, { displayOrder as navigationOrder } from "./layouts/navigationBasic";
import macbookAir2022Layout, { displayOrder as macbookOrder } from "./layouts/macbookAir2022";
import ansi104Layout, { displayOrder as ansi104Order } from "./layouts/ansi104";
import ansi60Layout, { displayOrder as ansi60Order } from "./layouts/ansi60";
import ansi75Layout, { displayOrder as ansi75Order } from "./layouts/ansi75";
import ansi96Layout, { displayOrder as ansi96Order } from "./layouts/ansi96";

export type BuiltinLayoutGroup = {
  id: "us" | "jp" | "scene" | string;
  name: string;
  layouts: LayoutData[];
};

const sortByOrder = (items: Array<{ layout: LayoutData; order: number }>) =>
  items.slice().sort((a, b) => a.order - b.order).map(({ layout }) => layout);

const usLayouts = sortByOrder([
  { layout: ansi104Layout, order: ansi104Order },
  { layout: ansi96Layout, order: ansi96Order },
  { layout: ansi75Layout, order: ansi75Order },
  { layout: ansi60Layout, order: ansi60Order },
  { layout: macbookAir2022Layout, order: macbookOrder }
]);

const jpLayouts: LayoutData[] = [];

const sceneLayouts = sortByOrder([
  { layout: fpsBaselineLayout, order: fpsOrder },
  { layout: navigationBasicLayout, order: navigationOrder }
]);

export const builtInLayoutTree: BuiltinLayoutGroup[] = [
  { id: "us", name: "US: ANSI US layout", layouts: usLayouts },
  { id: "jp", name: "JP: JP layout", layouts: jpLayouts },
  { id: "scene", name: "Scene: 特定用途", layouts: sceneLayouts }
];

export const builtInLayouts: LayoutData[] = builtInLayoutTree.flatMap(
  (group) => group.layouts
);

export default builtInLayouts;
