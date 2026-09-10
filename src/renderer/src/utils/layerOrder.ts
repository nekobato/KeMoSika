import type { LayoutItemData } from "@shared/types";

export type LayerDropPosition = "before" | "after";

export type LayerSelectionRequest = {
  itemId: string;
  additive: boolean;
  range: boolean;
};

/** Returns layout items in the front-to-back order shown in the layer panel. */
export const getLayerItems = (
  items: readonly LayoutItemData[],
): LayoutItemData[] => [...items].reverse();

/**
 * Moves one or more items in front-to-back layer order without mutating the
 * persisted back-to-front layout array.
 */
export const moveLayerItems = (
  items: readonly LayoutItemData[],
  movingItemIds: readonly string[],
  targetItemId: string,
  position: LayerDropPosition,
): LayoutItemData[] => {
  const movingIdSet = new Set(movingItemIds);
  if (movingIdSet.size === 0 || movingIdSet.has(targetItemId)) {
    return [...items];
  }

  const layerItems = getLayerItems(items);
  const movingItems = layerItems.filter((item) => movingIdSet.has(item.id));
  if (movingItems.length === 0) return [...items];

  const stationaryItems = layerItems.filter(
    (item) => !movingIdSet.has(item.id),
  );
  const targetIndex = stationaryItems.findIndex(
    (item) => item.id === targetItemId,
  );
  if (targetIndex < 0) return [...items];

  const insertionIndex = targetIndex + (position === "after" ? 1 : 0);
  const reorderedLayers = [
    ...stationaryItems.slice(0, insertionIndex),
    ...movingItems,
    ...stationaryItems.slice(insertionIndex),
  ];

  return reorderedLayers.reverse();
};

/** Creates a compact label from the data already stored on a layout item. */
export const getLayerItemLabel = (item: LayoutItemData): string => {
  if (item.type === "mouse") {
    return item.images.mouseDefault ? "マウス（画像）" : "マウス";
  }

  const character =
    item.text?.normalCharacter?.trim() ||
    item.text?.character?.trim() ||
    item.codeMap[0]?.trim();
  return character ? `キー ${character}` : "キー";
};
